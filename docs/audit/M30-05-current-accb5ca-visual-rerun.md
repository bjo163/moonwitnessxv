# M30-05 visual rerun at dev `accb5ca` — 2026-10-29

## Run identity

- Task: M30-05, `Certify behavior and screenshot tests`.
- Source HEAD: `accb5caa0a68f60dcdb3096388858375c647cc61` on `dev`.
- The shared checkout had pre-existing dirty files. At run start, Dock application source, MoonUI source/tests, and `scripts/ui` were clean; unrelated Cockpit, HQ, TODO, and prior audit/screenshot changes were preserved. Next rewrote `apps/dock/next-env.d.ts` during the run; that generated-only edit was restored afterward.
- UI harness used Dock on `http://127.0.0.1:3111` and a seeded, in-memory, ephemeral ARSY Hub on `http://127.0.0.1:3112/api/v1`. The Hub used no database, cron was disabled, and a random throwaway admin password was generated only in the local process environment; it was not recorded or printed.
- Captures are in [the isolated evidence directory](M30-05-current-accb5ca/geometry.json) and do not overwrite shared `docs/audit/screens/` artifacts.

## Commands and observed result

Hub command, run from `apps/arsy` with `MOONQL_AUTH_ADMIN_PASSWORD` set to a fresh random local value and the ARSY/RADIO/API title and port aliases set to `M30 Evidence Hub` / `3112`:

```text
pnpm exec tsx ../../scripts/ui/ephemeral-hub.mjs
```

The process reported `EVIDENCE_HUB_READY http://127.0.0.1:3112/api/v1 (in-memory, seeded, ephemeral)`.

Visual matrix command, run from repository root with `UI_PORT=3111`, `UI_HUB_URL=http://127.0.0.1:3112/api/v1`, and `UI_SCREENS_DIR=docs/audit/M30-05-current-accb5ca`:

```text
pnpm exec playwright test --config scripts/ui/playwright.config.mjs scripts/ui/visual.spec.mjs
```

Observed: **44 passed, 0 failed, 1 skipped**. Geometry records contain 32 viewport/locale cases and 8 reduced-motion cases, with 0 assertion failures, 0 horizontal overflow, 0 interactive elements outside the viewport, 0 elements outside the viewport, and 0 console errors (including no observed hydration errors). Home, reader, terms index, constellation, reduced-motion, keyboard, and UTC/local clock checks passed.

## Remaining gap

The term-detail discovery case did not find a public term link: the terms index rendered its `error` branch even though the ephemeral Hub was reachable (`hubMode: live-hub`). The visual spec therefore recorded the term-detail screenshot matrix as **skipped**, not passed. The API's current public-read containment prevents this test from treating private/withheld terms as a public visual fixture. No ACL was bypassed and no rights-bearing source was introduced. M19-19 still has no approved D08 public projection, so this rerun does not satisfy M30-05's term-detail gate.

## Security, review, rollback, and disposition

- Data used: seeded in-memory Hub data only; no live database, remote service, deployment, private source content, or persistent credential.
- Product source changes: none. Only screenshots and `geometry.json` were produced in the new audit directory.
- Rollback: remove this supplemental report and its evidence directory if the artifacts are not wanted; no product code rollback is applicable.
- Independent read-only AI review: `/root/review_m30_current` inspected the report, geometry, and a Dock screenshot; it confirmed the counts and skip diagnosis. This is not the required human review or release approval.
- Result: M30-05 remains **OPEN**; no TODO checkbox was changed. Next eligible work is to supply an authorized, non-private term-detail fixture/projection and complete the matrix, then obtain the required independent human review.