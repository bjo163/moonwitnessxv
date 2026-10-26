# M19-11 — Dock English home copy

- **Task:** M19-11, write and integrate the English landing content.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisites:** M19-09 and M19-10 are checked in the current TODO working tree.
- **Worker:** `/root/m19_11_english_home`.
- **Claimed/actual task path:** `apps/dock/test/landing-copy-english.test.mjs`, plus this report. Existing `apps/dock/src/lib/landing-copy.ts` already contains the full English landing catalog, paired with Indonesian under M19-10; this task adds acceptance coverage without duplicating or rewriting that content.
- **Result SHA/reviewer:** pending integrator commit and review.

## Copy and claim review

The English catalog has the same semantic keys as the Indonesian catalog and is consumed by the same Dock homepage components through `getLandingCopy(locale)`. Reviewed English mission copy follows the approved [Mission guide](../vision/chapters/MISSION.md): it names ALLAH, Nabi Muhammad SAW, and Nabi Isa AS, describes voluntary participation, and does not claim divine authorization. Copy for schedule-dependent states and planned story concepts labels those states explicitly; the station map says its markers are illustrative. The English OSINT heading does not claim a live AI-triaged feed. English human-authored catalog text contains no source passage or runtime/API values.

## Evidence

- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/landing-copy-english.test.mjs` — exit 0; 4 passed, 0 failed. Positive assertions cover key parity, schedule/readiness labels, approved mission terms, illustrative map and planned concepts. Negative assertions reject a missing English mission key and check for the previously identified fabricated metrics/date/live-AI claims.
- `pnpm --filter @moonwitness/dock test` — exit 0; 17 passed, 0 failed, 0 skipped.
- `pnpm exec eslint apps/dock/test/landing-copy-english.test.mjs` — exit 0.
- `git diff --check -- apps/dock/test/landing-copy-english.test.mjs` — exit 0.

Node emitted the existing `MODULE_TYPELESS_PACKAGE_JSON` warning while directly importing the Dock TypeScript catalog through Node's strip-types test runner; all tests passed. No TSX, runtime, manifest, or package dependency was changed, so no task-specific build or TypeScript check was needed. The tests do not claim visual/browser verification or deployment.

## Safety, rollback, and handoff

No rights-bearing source passages, testimony, personal data, credentials, network requests, or external services are used. No application behavior or routing was changed. Rollback removes the focused test and this report. The integrator should record the final source SHA after commit and decide TODO closure; M19-12 and M19-14 are separate dependent work.
