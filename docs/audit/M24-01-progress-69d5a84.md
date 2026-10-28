# M24-01 — Interim containment and terms evidence

- **Task:** M24-01 — Audit A-L-L-A-H USGS/GDACS/NOAA/Open-Meteo historical code and terms
- **Baseline:** `61d06028497a2f2561017a67d3550a429041ef48`
- **Implementation result SHA:** `69d5a84c60e1e35e90526d1cc3802df820b17380`
- **Owner:** integrator
- **Status:** partial progress; M24-01 remains open
- **Related terms review:** [M24-01-provider-terms-2026-10-29.md](M24-01-provider-terms-2026-10-29.md)

## Changes at the implementation SHA

- Dock no longer renders the seeded monitor rows, their invented urgency/view counts, or their unverified editorial status. The World Monitor area states in English and Indonesian that no provider feed is connected and that seeded samples are withheld until source, observation time and freshness can be shown.
- Headquarters no longer requests the monitor overview to populate fallback counts. Research Lab and World Monitor show unavailable/unverified states. The 14-system reference catalogue no longer presents literal operational, telemetry or synchronization states as measured runtime status.
- Added a regression assertion that the Dock home does not render `payload.signals` and shows the localized provenance/freshness notice.

## Verification at the implementation SHA

| Command | Observed result |
|---|---|
| `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/home-spaces.test.mjs test/landing-copy.test.mjs test/landing-copy-english.test.mjs` | PASS — 16 tests, 16 passed |
| `pnpm --filter @moonwitness/dock typecheck` | PASS — `tsc --noEmit` |
| `pnpm --filter @moonwitness/headquarters typecheck` | PASS — `tsc --noEmit` |
| `pnpm exec eslint apps/dock/src/app/page.tsx apps/dock/src/lib/landing-copy.ts apps/dock/test/home-spaces.test.mjs apps/dock/test/landing-copy.test.mjs apps/dock/test/landing-copy-english.test.mjs apps/dock/test/required-landing-ui-keys.mjs 'apps/headquarters/src/app/(admin)/page.tsx'` | PASS — no diagnostics |
| Pre-commit UI consistency gate | PASS — 139 files scanned, 0 violations |
| `pnpm --filter @moonwitness/dock test` | FAIL — 307 tests: 304 passed, 3 failed in the pre-existing local Patches Explorer work (`panel-state-contract`, `responsive-accessibility`, `ui2-p16-patches-census-states`). Those files were not included in this commit. |

No deployment, live provider fetch, database query, or production behavior was tested.

## Remaining acceptance gaps

- The public World Monitor contains no provider-backed observations yet. Hiding seed rows makes the current presentation honest; it does not supply the provider, observation timestamp and freshness model required by the updated TODO acceptance or M24-02.
- No specific USGS, GDACS, NOAA or Open-Meteo product has been selected. The dated source review records general provider terms and constraints but does not grant project-specific reuse approval.
- The historical `bjo163/allah-hub` source is inaccessible through the Git remote and the connected GitHub API returned 404. This does not establish whether it is private, deleted or otherwise unavailable. The repository's `71a80c94dae0021b` and `47bac90cade77ee2136cb66d546156b220fe8481` pins still conflict; neither historical code nor a licence grant was verified.
- M24 milestone review and any required independent human rights review remain outstanding. AI review is not recorded as human approval.

The TODO checkbox must remain open until the remaining acceptance evidence and required review are satisfied.
