# M19-10 — Dock Indonesian home copy

- **Baseline:** M19-09 route baseline at `0f3a252af6e7b7d803cedab121a443911d820279`.
- **Integrated result SHA:** `941cb2447eb8fc4fe30e03a2566f6a062cc4a5aa`.
- **Scope:** Indonesian localization of human-authored Dock landing UI, with its English source retained in an app-owned catalog. This does not complete the wider English pass (M19-11), locale selector (M19-12), metadata (M19-14), or other route copy.
- **Authority:** devotional statement translated from the approved [Mission guide](../vision/chapters/MISSION.md). Locale behavior follows [ADR-0005](../decisions/ADR-0005-locale.md); source passages and runtime/API values remain outside the catalog.

## Changes

- Added stable-key `en`/`id` home copy in `apps/dock/src/lib/landing-copy.ts`, consumed by the home page, hero, feature cards, station map, schedule/archive presentation, charts, and weekly schedule.
- Added server-side locale context from the validated `/id` or `/en` rewrite. Middleware overwrites the internal `x-mw-locale` request header; a caller-provided value is not trusted. Missing or invalid context defaults to English.
- Removed unsupported synthetic crew/signal counters and the hard-coded `03:24` presentation. Catalog counts now use the observed station/country data; existing schedule counts remain identified as listed schedule slots.
- Replaced the unverified “LIVE” state with “SCHEDULED” or “NO CURRENT SCHEDULE SLOT” based on current schedule data. Static archive artwork/titles remain, but fabricated dates are removed and concepts are labeled “PLANNED/RENCANA.” The map copy states that its markers are illustrative. The “explore stories” action now describes its existing station-list destination.
- Neutralized the static OSINT heading to “OSINT MONITORING” / “PEMANTAUAN OSINT”; dynamic OSINT titles, summaries, platform values, scores, and source text remain verbatim.
- Left Arabic/source/poster material, station and OSINT runtime content, machine values, external links, and API routes unchanged.

## Rights and claim boundary

The mission text is based on the repository's approved mission guide, preserving ALLAH, Nabi Muhammad SAW, and Nabi Isa AS; it states voluntary participation and no claim of divine authorization. No new spiritual authority or product readiness is asserted. Existing source passages and poster content are not paraphrased or placed in the locale catalog. Static archive artwork and titles are retained as concepts, not represented as dated historical transmissions.

## Verification

Commands executed on the working tree:

- `pnpm --filter @moonwitness/core build` — passed.
- `pnpm --filter @moonwitness/dock test` — passed, 10 tests after the final illustrative-map, destination-copy, and neutral OSINT-label assertions.
- `pnpm --filter @moonwitness/dock typecheck` — passed after using the `.mjs` helper extension.
- `pnpm --filter @moonwitness/dock build` — passed; Next.js reported the existing middleware-to-proxy deprecation notice.
- Scoped ESLint on changed Dock TS/TSX/MJS files — passed.
- `git diff --check` — passed.

The route tests cover `/id` and `/en` header overwrite behavior and confirm no client-visible `x-mw-locale` response header. Catalog tests cover key parity, approved mission terms, safe default locale behavior, illustrative map labeling, actual button destination wording, absence of fabricated counters/dates/duration, and neutral static OSINT labels. This report does not claim deployment or visual browser verification. The middleware locale-context change is coupled to rendering localized routes and should receive integrator review as a narrow M19-09 integration adjustment.

The integrator reviewed the landing copy and ran `pnpm verify` on the exact result SHA above; GitHub Actions run [`40378453247`](https://github.com/bjo163/moonwitnessxv/actions/runs/40378453247) passed on that SHA. The promote-to-main job was skipped because the run was for a pull request. No deployment or visual browser verification is claimed.

## Rollback

Revert the catalog and its UI consumers, locale helper/header forwarding, and focused tests together to return Dock home rendering to its English-only baseline. No TODO status or API contract was changed.
