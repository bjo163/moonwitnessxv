# M19-19 — UNILEX detail-route containment evidence

**Status:** scoped anonymous-access containment verified; M19-19 remains open because no approved D08 public projection exists.

**Baseline:** `dev` at `d7c5103b75316fa21ae4547bc9c8aa1f19a247e2`.

**Implementation/result SHA:** `f45e9587b3e9113c057b1e9f5224931c6a271cef` (`dev`).

## Change

The discovered anonymous `/unilex/term` detail projection serialized definitions, headwords, citations, and reviewer/audit details for an unapproved term. The route now requires the existing `admin` role. Negative tests assert an anonymous guessed detail returns 401 with none of the synthetic canary values; positive controls verify authorized admin review still receives the detail. Invalid/missing IDs are checked only after authorization, so anonymous requests cannot enumerate terms.

Dock's `readTerm` maps the new 401 denial to its existing `null`/`notFound()` path rather than surfacing an error page. A focused Dock test covers this denial. Since the generated schema classifies the ACL change as breaking (`GET /unilex/term is no longer public`), ARSY's default and `.env.example` API version moved from 2.1.0 to 3.0.0 and the generated client, snapshot and append-only schema history were refreshed.

Changed paths in the implementation commit:

- `packages/moonql-unilex/src/index.ts`
- `apps/arsy/src/config.ts`, `.env.example`
- `apps/arsy/test/public-projection-denial.test.ts`, `unilex.test.ts`, `unilex-pg.test.ts`
- `apps/dock/src/data/queries/terms.ts`, `apps/dock/test/research-ai-unavailable.test.mjs`
- `packages/moonql-client/src/generated.ts`, `schema-snapshot.json`, `schema-history.json`

## Verification at the exact implementation SHA

| Command | Observed result |
|---|---|
| `pnpm --filter @moonwitness/arsy exec tsx --test test/public-projection-denial.test.ts test/unilex.test.ts test/unilex-pg.test.ts` | 20 passed, 0 failed, 2 skipped. One pre-existing documentary test remains skipped; PostgreSQL coverage skipped because no `PARITY_DATABASE_URL`/`DATABASE_URL` was configured. |
| `pnpm --filter @moonwitness/dock exec node --test test/research-ai-unavailable.test.mjs` | 8 passed, 0 failed, 0 skipped. |
| `pnpm --filter @moonwitness/arsy typecheck` | exit 0 (`tsc --noEmit` and test tsconfig). |
| `pnpm --filter @moonwitness/moonql-unilex typecheck` | exit 0. |
| `pnpm --filter @moonwitness/dock typecheck` | exit 0. |
| PowerShell temporarily set `$env:API_VERSION = '3.0.0'`, ran `pnpm gen:sdk:check`, then restored the prior environment value | generated SDK is up to date. |
| `pnpm exec eslint packages/moonql-unilex/src/index.ts apps/arsy/src/config.ts apps/arsy/test/public-projection-denial.test.ts apps/arsy/test/unilex.test.ts apps/arsy/test/unilex-pg.test.ts apps/dock/src/data/queries/terms.ts apps/dock/test/research-ai-unavailable.test.mjs` | exit 0, no diagnostics. |
| `git diff --check HEAD^ HEAD -- .env.example apps/arsy/src/config.ts apps/arsy/test/public-projection-denial.test.ts apps/arsy/test/unilex-pg.test.ts apps/arsy/test/unilex.test.ts apps/dock/src/data/queries/terms.ts apps/dock/test/research-ai-unavailable.test.mjs packages/moonql-client/src/generated.ts packages/moonql-client/src/schema-history.json packages/moonql-client/src/schema-snapshot.json packages/moonql-unilex/src/index.ts` | exit 0, no whitespace errors. |

Before the bump, `pnpm gen:sdk:check` reported the change as breaking. `pnpm gen:sdk --allow-breaking`, with `API_VERSION=3.0.0` set for that invocation, accepted major 2 → 3 and generated the SDK artifacts. The Git pre-commit UI gate also passed (138 files scanned, 0 violations).

## Limits and remaining DoD

- The route-level containment denies every anonymous caller; it does not make `/unilex/term` a reviewed public projection. Dock now treats denied detail as not found.
- No D08 release store or approved D08 projection was created. Dock `/research` and `/reader/compare` continue to return their withholding notices. Other explicitly documented public projection gaps are outside this scoped UNILEX route change and remain unverified/ open.
- The PostgreSQL slice did not run; no live Hub/database, browser, CI, production environment update, or deployment was tested. Deployments must explicitly use API version 3.0.0 before release; this work only changes the repository default and example.
- M19-19 is not closed: its public-rights/projection acceptance still requires an approved D08 projection and positive/negative publication tests against that exact release contract.
