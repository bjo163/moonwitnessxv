# M19-02 — Experience layout/typography tokens: audit

- **Task:** M19-02 — Define Reader/Research/Story/Operator layout/typography tokens (P1 · D3 · depends M19-01, closed).
- **Baseline:** branch `dev`, HEAD `eb3b9f085da73e1e19d8686d467dab95c2b7d13e` (`eb3b9f0`), dirty worktree owned by another session.
- **Date:** 2026-10-27.
- **Scope:** typed token group + tests + documentation. No app consumes it yet.
- `TODO.md` was **not** edited; nothing was committed or pushed.

## Claimed and actual files

| File | Change |
|---|---|
| `packages/moonui/src/tokens.ts` | added `MoonExperienceName`, internal `MoonExperience` shape, `MOON_EXPERIENCES` (four modes, `as const satisfies`) |
| `packages/moonui/src/index.ts` | re-exported `MOON_EXPERIENCES` and `type MoonExperienceName` inside the existing tokens block; no other export touched |
| `packages/moonui/test/experience-tokens.test.ts` | new suite (13 tests) |
| `docs/design/M19-02-experience-tokens.md` | new design note |
| `docs/audit/M19-02-experience-tokens.md` | this artifact |

Not changed: `packages/moonui/moon.css`, any existing token value, any app, any TODO/decision record. `git diff --stat -- packages/moonui` → `src/index.ts | 2 +`, `src/tokens.ts | 140 ++`, plus the untracked test file; the other session's modified/untracked files were left untouched.

**Packet divergence (integrator must confirm):** [`docs/tasks/M19/M19-02.md`](../tasks/M19/M19-02.md) frames a *Dock-scoped* slice and explicitly says a new token belongs to MoonUI/M19-01, not to that slice. This leaf was authorized by the owner brief to add the MoonUI token group itself. The packet's "one changed-file claim" is therefore not satisfied by this leaf's five files; the parent TODO row stays open regardless, and closing it needs an explicit owner/integrator decision.

## Commands and observed results

Run from `Z:\project\moonradio` (Windows, bash):

1. `pnpm --filter @moonwitness/moonui test`
   - `tsc -b` succeeded, then `node --experimental-strip-types --test test/**/*.test.ts`.
   - Observed: **tests 39, suites 7, pass 39, fail 0, cancelled 0, skipped 0, todo 0** (duration ≈ 1005 ms). Existing accessibility/components/tokens suites all still pass.
   - New suites observed green: `MOON_EXPERIENCES — four reading modes` (7/7), `MOON_EXPERIENCES — intentional differences without semantic drift` (3/3), `MOON_EXPERIENCES — palette guard` (3/3).
2. `pnpm --filter @moonwitness/moonui typecheck`
   - `tsc --noEmit` → exit 0, no diagnostics.
3. `pnpm exec eslint packages/moonui/src/tokens.ts packages/moonui/src/index.ts packages/moonui/test/experience-tokens.test.ts`
   - exit 0, no output.

## Positive evidence (what the suite pins)

- Exactly four modes: `Object.keys(MOON_EXPERIENCES)` equals `reader, research, story, operator`.
- All four modes expose the identical key-path set (15 paths), compared against a literal `EXPECTED_KEYS` list, so a rename/addition fails.
- `story` vs `reader`: identical key paths and identical value types for `measure`, `maxWidth`, `density`; `lineHeight` numeric in both — no relabelled semantics.
- Every `fonts.{heading,body,code}` is a `MOON_FONTS` member; `fonts.body === MOON_FONTS.sans` and `fonts.code === MOON_FONTS.mono` in all modes.
- Every `space.{gutter,section,inline}` is a `MOON_SPACING` member.
- Type scale strictly descends (display > heading > body ≥ caption), body ≥ 12px, code ≥ 10px, line-height inside 1.25–2.
- Reader vs operator: `measure`, `maxWidth`, `density` all differ and reader leading exceeds operator leading.
- Four distinct densities; every pair of modes differs in JSON.
- Palette guard: no colour literal outside `MOON_COLORS`; no colour-shaped key (`color|palette|tone|hex|rgba`) in any mode.

## Negative guard evidence

The guard is proven in two ways — the suite's own self-check and an out-of-band mutation run against the built module (no source file modified):

```
$ node --input-type=module -e "…import dist/tokens.js; clone; inject #ff2a85; delete story.measure…"
rogue-color-detected: ["#ff2a85"]
key-drift-detected: true
font-member-ok: true
spacing-member-ok: true
```

- Injecting `operator.palette.bg = '#ff2a85'` into a clone makes the colour detector return that literal, i.e. the palette test would fail on a rogue hex.
- Deleting `story.measure` from a clone makes the key-path comparison report drift, i.e. the invariant test would fail on a semantic change.
- In-suite self-check `detects a rogue literal (guard self-check)` asserts `{ bg: '#ff2a85' }` is flagged while `{ measure: '68ch' }` is not, and that `MOON_COLORS.cyan` is accepted.

## Security, rights, privacy, i18n

- No secret, environment value, private witness material or source content is introduced; the change is four string/number maps.
- No new font family, bundled font file, image or audio → no rights or licensing question is opened.
- No copy, locale catalog, `dir` or ARIA behaviour is touched; density changes spacing only, never keyboard/focus order. `id`/`en` parity is unaffected because there are no new strings.

## Rollback

Revert the integration commit (or delete the five files above; `packages/moonui/src/index.ts` and `tokens.ts` return to their pre-change state). No data, schema, build config, deployment or asset state is involved, so rollback is a pure source revert and requires no data migration.

## Limitations

- **No consumption yet:** no app reads `MOON_EXPERIENCES`; Dock, Headquarters, Cockpit, Skylink and Echolog keep their current inline scales. Adoption is separate authorized work.
- **No rendering, screenshot, browser or visual-diff verification was performed**, and none is claimed. The values are a design decision, not observed typography on a surface.
- **No deployment is claimed.** Nothing was built for production, published, or promoted; only the package's own `tsc -b` output in `packages/moonui/dist` was produced to run the tests.
- **No `pnpm ui:check`, root build or root test was run**; those cover a worktree that currently contains another session's uncommitted changes, so their result would not be attributable to this leaf.
- `TODO.md` row M19-02 remains open pending integrator review; the packet divergence above is unresolved.
