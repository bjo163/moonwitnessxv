# M28-05 audit — ARSY env branding with legacy Radio aliases

- **task_id:** M28-05 — Reconcile ARSY config/type/service branding with legacy Radio env compatibility.
- **baseline_sha:** `bf9d4581e1b85c6e79ca545dcc815fe22d5cfbc9` (`dev`, as assigned). The shared worktree HEAD advanced concurrently to `5562f9b99bbfd6c4cbc48f56eea11348fa4a0fd2` (`test(arsy): assert the radio alias…`, touching `compose-contract.test.ts` only); none of this task's hunks were committed.
- **worker:** ARSY config agent.
- **claimed_files:** `apps/arsy/src/config.ts`, `apps/arsy/test/arsy-env-compat.test.ts`, `.env.example`, `docs/audit/M28-05-arsy-env-aliases.md`.
- **actual_changed_files:** the four claimed files. `apps/arsy/src/config.ts` and `.env.example` are shared with an uncommitted concurrent M38-12 SKYLINK change (schema keys, client module, app wiring); those lines are not this task's work. The three `SKYLINK_*` template lines were added here only because the shared env-contract test requires every schema key to be documented after that concurrent addition. No other file was edited by this worker.
- **result_sha:** uncommitted working tree (no commit, no staging).

## Behavior delivered

`ARSY_PORT` / `ARSY_PREFIX` / `ARSY_TITLE` are the preferred spellings; `RADIO_*`
and the generic `PORT` / `API_PREFIX` / `API_TITLE` remain accepted. Every
configured spelling must resolve to the same value. A disagreement throws from
`parseConfig`/`loadConfig` before the server calls `buildApp` or listens:
`Conflicting environment aliases for ARSY_PORT: ARSY_PORT, RADIO_PORT are set to
different values. Set only one spelling, or give every configured spelling the
same value.` The error names keys only, never values.

Branding is now consistent in code: `ArsyConfig` and `ARSY_ENV_KEYS` are canonical;
`RadioConfig` / `RADIO_ENV_KEYS` remain as deprecated aliases so existing imports
compile unchanged. `.env.example` ships `ARSY_API_URL` as the active spelling and
keeps `RADIO_API_URL` documented as a commented legacy alias. Station, playback,
schedule, playlog and listen domain names are untouched.

## Positive evidence

Command (from `apps/arsy`):

```
pnpm exec tsx --test --test-reporter=spec test/arsy-env-compat.test.ts test/config-aliases.test.ts test/env-contract.test.ts
```

Observed: `tests 22`, `pass 22`, `fail 0`. Includes each legacy spelling resolving
byte-for-byte like its `ARSY_*` counterpart, equal dual spellings accepted, empty
values treated as unset, and a child-process `loadConfig()` boot with `ARSY_*` only
and with `RADIO_*` only.

Direct single-spelling boot probes (child `node --import tsx`, no inherited aliases):

```
ARSY_PORT=3111 ARSY_PREFIX=/api/arsy ARSY_TITLE='ARSY Hub' -> {"port":3111,"prefix":"/api/arsy","title":"ARSY Hub"} exit=0
RADIO_PORT=3111 RADIO_PREFIX=/api/arsy RADIO_TITLE='ARSY Hub' -> {"port":3111,"prefix":"/api/arsy","title":"ARSY Hub"} exit=0
```

Static checks, all observed exit 0:

```
pnpm --filter @moonwitness/arsy build
pnpm --filter @moonwitness/arsy typecheck
pnpm exec tsc --noEmit -p apps/arsy/test/tsconfig.json
pnpm exec eslint apps/arsy/src/config.ts apps/arsy/test/arsy-env-compat.test.ts
```

The build was needed to refresh gitignored `dist/*.d.ts` before the test project
(which references `../tsconfig.json`) could see the new `ARSY_ENV_KEYS` export.
No build artifact is part of the change.

## Negative evidence

Command:

```
ARSY_PORT=3100 RADIO_PORT=3200 DATABASE_URL='postgres://witness:top-secret@db:5432/witness' \
  node --import tsx --input-type=module -e "…loadConfig()…"
```

Observed stderr:

```
Conflicting environment aliases for ARSY_PORT: ARSY_PORT, RADIO_PORT are set to different values. Set only one spelling, or give every configured spelling the same value.
```

`exit=1`; stdout empty (nothing can start before the refusal); stderr contains
neither the configured port values nor the unrelated `DATABASE_URL` password.
The test matrix additionally rejects `ARSY_PREFIX` vs `RADIO_PREFIX`/`API_PREFIX`,
`ARSY_TITLE` vs `RADIO_TITLE`/`API_TITLE`, `PORT` vs both, and the shared client
resolver still refuses `ARSY_API_URL` vs a different `RADIO_API_URL`.

Baseline note: `arsy-env-compat.test.ts` had one pre-existing failure because it
asserted an inline dev-runner ternary removed by `scripts/dev.mjs`'s registry
refactor. The assertion now checks the registry `ALIASES` table and the runner's
use of it, preserving the original intent (radio is a transition alias only).

## Security, rights, privacy

No secret values are read, echoed or written; probes use a fake credential only to
prove errors do not dump the environment. No auth, identity, role, data, rights,
consent or UI change. No second Hub, no new service identity, no SQL owner or
migration. `RADIO_*` remain compatibility names for the one ARSY Hub.

## Reviewer

Pending independent review by the integrator/reviewer; this worker does not
self-approve the parent task.

## Rollback

Uncommitted change, so rollback is hunk-selective: revert the M28-05 branding,
error-message and test hunks in `apps/arsy/src/config.ts` and
`apps/arsy/test/arsy-env-compat.test.ts`, restore the previous `.env.example`
lines, and delete this audit file. **Do not** run a file-level
`git checkout -- apps/arsy/src/config.ts` or `.env.example`: both also contain
another worker's uncommitted M38-12 edits.

## Limitations

- README still says HQ talks over `RADIO_API_URL`; README was outside this task's
  allowed file set. The value remains correct but is the legacy spelling.
- The shared client resolver (`packages/moonql-client/src/web.ts`, outside scope)
  treats an empty `ARSY_API_URL` as set; with a non-empty `RADIO_API_URL` it
  refuses as a conflict, while the hub treats empty as unset. Fail-closed, but the
  empty-value semantics are not yet identical across consumers.
- The M28-02 compatibility map says the canonical spelling "wins" on conflict;
  M28-05's DoD requires loud rejection, which is what is implemented. The map was
  not edited (outside scope).
- "Boots" here means the real `loadConfig()` process gate exits 0; no listen,
  database, Docker or deployment claim is made. Only focused tests plus ARSY
  package checks were run, not the full repository suite.
