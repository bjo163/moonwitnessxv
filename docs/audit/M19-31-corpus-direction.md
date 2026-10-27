# M19-31 — Corpus translation direction remains source-owned

- task_id: M19-31
- baseline_sha: 7a5cba95f1e2bcef47da9ec6fb25415c8aba7987
- implementation_sha: a60c590ce6ccf937fe6a84dd868b55aec238bb52
- exact_sha_CI: full verification workflow 40532769513 passed at integrated SHA `2257139321c77e9d0ec9a12c61af32cc2c13eefa`; guarded promotion to main succeeded. This supersedes the earlier promotion failure in run 40515208465.
- reviewer: independent read-only review found no blocker
- rollback: revert the additive Corpus direction field and Dock projection/render change; no stored rows are rewritten
- next_eligible_task: M19-32 is eligible after M19-31 integration; M19-33 still waits on M19-23

## Changed paths

- apps/arsy/test/corpus-reader.test.ts
- apps/dock/scripts/verify-reader-ui.tsx
- apps/dock/src/data/queries/reader.ts
- apps/dock/src/ui/components/reader.tsx
- apps/dock/test/locale-boundary-coverage.test.mjs
- apps/dock/test/reader-rights.test.mjs
- docs/audit/ui2-g10-locale-boundary-47b89f4.md
- packages/moonql-client/src/generated.ts
- packages/moonql-client/src/schema-history.json
- packages/moonql-client/src/schema-snapshot.json
- packages/moonql-corpus/src/index.ts

Corpus now owns nullable ltr/rtl direction metadata. New Indonesian seed data states ltr explicitly; legacy rows stay null. Dock applies the source-owned value and uses dir=auto for unknown legacy rows. It does not infer direction from languageCode. Text, diacritics, citation text, and rights filtering remain unchanged.

## Verification observed

- pnpm --filter @moonwitness/moonql-corpus build — exit 0.
- pnpm --filter @moonwitness/arsy exec tsx --test test/corpus-reader.test.ts — 7/7 passed, including Hebrew legacy null, explicit Hebrew rtl, explicit Greek ltr, preserved diacritics, unchanged citation, and existing rights-denial cases.
- pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/reader-rights.test.mjs — 5/5 passed.
- pnpm gen:sdk:check — generated SDK up to date.
- The M19-31 isolated patch had an independent review and passed its focused Dock locale/right tests, Dock and ARSY typechecks, build, scoped ESLint, and UI drill (28 checks) before integration.
- Exact-SHA full GitHub verification for implementation `a60c590` passed, but its guarded promotion job failed. The current integrated SHA `2257139` contains that unchanged implementation; full verification and guarded promotion both passed in run `40532769513`.

## Workspace limits and rights

The shared dev checkout contains separate uncommitted Dock copy/constellation work. That work currently makes the local locale-boundary module fail during import because its two locale catalogs have mismatched keys; Dock typecheck also reports missing/duplicate keys in those unrelated files. I preserved those changes and did not edit or stage them. The focused M19 tests passed locally (ARSY corpus 7/7; Dock reader rights 5/5; SDK current). The full exact integrated-SHA CI run at `2257139` passed and promoted that SHA to main. The older exact implementation run's promotion job failed; it is superseded by this later integrated result.

No source material was added. Tests use synthetic fixture strings. Reader text keeps its language attribution and exact bytes; unknown rights continue to withhold text. No UI locale is substituted for source direction.
