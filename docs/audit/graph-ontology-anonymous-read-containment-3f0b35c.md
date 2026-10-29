# Graph and Ontology anonymous-read containment

- **Baseline:** `accb5caa0a68f60dcdb3096388858375c647cc61` on `dev`
- **Implementation SHA:** `3f0b35cd9a9538cf6919e67991f1bbdf6d81f0d3`
- **Scope:** contain anonymous access to current Graph/Ontology candidate and reviewer data while no approved D08 public projection exists.
- **Status:** partial security containment only. This does not close M19-19, M20-04, M27-08, or M27-16 and does not approve a public release.

## Changes

- The seven data-bearing Graph routes and `/ontology/constellation` now require `ADMIN_ONLY`; static `/graph/policy` remains public.
- Raw Graph candidate/release/adjacency and Ontology source/entity/alias/relation REST models now use `ADMIN_FULL`, preventing anonymous list/get access while preserving authorized administration.
- Dock's Constellation panels and relation detail render an Indonesian/English D08 withholding notice on 401/403. The Dock SDK still sends no admin credential. Infrastructure failures remain availability errors.
- The breaking API ACL change advances the default and example API version to `5.0.0`; generated SDK/snapshot/history are current.

## Exact-SHA verification

All commands below were run after commit `3f0b35cd9a9538cf6919e67991f1bbdf6d81f0d3` was created, with that commit as `HEAD`.

| Command | Result |
|---|---|
| `pnpm --filter @moonwitness/moonql-graph build` | Passed |
| `pnpm --filter @moonwitness/moonql-ontology build` | Passed |
| `pnpm --filter @moonwitness/arsy exec tsx --test test/graph.test.ts test/graph-pg.test.ts test/ontology.test.ts test/ontology-pg.test.ts test/public-projection-denial.test.ts` | 29 total, 27 passed, 0 failed, 2 PostgreSQL slices skipped because no `PARITY_DATABASE_URL`/`DATABASE_URL` was configured |
| `pnpm --filter @moonwitness/arsy typecheck` | Passed, including test TypeScript |
| `pnpm --filter @moonwitness/dock test` | 313 passed, 0 failed, 0 skipped |
| `pnpm --filter @moonwitness/dock typecheck` | Passed |
| `pnpm --filter @moonwitness/dock build` | Passed; the Constellation and relation routes are server-rendered on demand |
| `pnpm gen:sdk:check` | Passed; generated SDK is up to date |
| `pnpm exec eslint` on the changed TypeScript/TSX and test files | Passed |
| `pnpm ui:check` | Passed; 140 files scanned, 0 violations; also passed in the commit hook |

Independent AI code review found no remaining blocker in this containment diff. That is code review, not a human privacy/reviewer-authority ratification.

## Limits and follow-up

- No PostgreSQL-backed test, live Hub, browser against a running Hub, deployment, or production API was exercised.
- No D08 allowlist/public projection or reviewer identity authority was introduced. The Dock therefore continues withholding these surfaces.
- The separate public `journey_mandates` REST/`activeMandates` gap remains open under M27-16; this change does not address it.
- The running deployment must be updated to API version `5.0.0` before relying on the regenerated contract. No deployment is claimed.
- Do not check any TODO box from this evidence alone.
