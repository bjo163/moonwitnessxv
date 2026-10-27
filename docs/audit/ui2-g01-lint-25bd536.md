# UI2-G01 lint ledger, and the G13 CI observation at `25bd536`

**Scope:** [todo-ui-2.md](../../todo-ui-2.md) gate **UI2-G01** (P0 · D2 · "Fix 10 exact-SHA CI lint errors … do not disable lint. DoD: `pnpm lint` passes, exact error ledger resolved") and the CI evidence that **UI2-G13** will need. **G13 is not closed here** — see §4.
**Prior evidence:** [ui2-preflight-2026-10-27](ui2-preflight-2026-10-27.md) · **Depends on:** UI2-G00 (lockfile), recorded as already satisfied in that audit's addendum.

## 1. Baseline

| Item | Observed |
|---|---|
| Branch | `dev`; no topic branch created (Owner Policy) |
| HEAD at start | `2559b42` — the branch moved repeatedly while this ran (`17b6777`, `bd11cf2`, `8543b83`); re-checked before every `git add` |
| Working tree | not clean throughout: other sessions' uncommitted `apps/arsy`, `apps/skylink`, `apps/orbit`, `apps/cockpit` and `package.json` files were present and were never added, modified or committed |
| Commands actually run | `pnpm lint`, `npx eslint <file>`, `gh run list --branch dev`, `gh run view <id> --json jobs`, `gh run view <id> --log-failed`, `gh run watch 40477422279 --exit-status`, `pnpm ui:check`, `git` read/commit only. **No** install, no dev server, no deploy, no push to `main` |

## 2. The error ledger, resolved

The preflight recorded 10 lint errors at `d54ad43aef`. That ledger is **historical**: by the time this gate was picked up, those ten rows no longer described the tree. What actually failed, measured:

| SHA | `pnpm lint` result | Cause |
|---|---|---|
| `9a1bf85` | 1 error | `scripts/ui/ephemeral-hub.mjs 42:44 error Parsing error: Unexpected token as` — introduced by this session's own evidence-hub script: a `.mjs` file carrying a TypeScript `as const` cast, which the repo's ESLint parses as plain JavaScript |
| working tree at `2559b42` | 5 errors | `apps/orbit/src/components/OrbitShellHeader.tsx:19` unused destructured prop `lastSyncTimestamp`, and `apps/orbit/test/orbit-runtime-binding.test.mjs:76,112,166,193` `'Response' is not defined` — the config's Node-globals block is scoped to `packages/*/test/**/*.mjs`, so app test runners must use an inline `/* global */` comment (the established pattern, see `apps/dock/test/home-offline.test.mjs:1`) |
| `6e9fa87` (this session) | — | the `as const` removed; array literal only |
| `3e89805` (orbit session) | — | prop removed from the destructuring, `/* global Response */` added, plus a new assertion that the timestamp is actually rendered in the page footer |
| `bd11cf2` / `25bd536` | **0 errors, 58 warnings** | green |

Nothing was disabled, no rule was turned off, and no file was added to an ignore list. The 58 remaining problems are all `Forbidden non-null assertion` warnings, which do not fail the gate.

## 3. G13 — what CI actually proves at these SHAs

`gh run list --branch dev` at 08:59Z, and `gh run watch 40477422279 --exit-status` afterwards:

| Run | SHA | Result |
|---|---|---|
| 40476362621 | `bd11cf243d7e5515357fa3eaf1f4731f690e9a10` | **success** |
| 40477422279 | `25bd5361b62ce558622cebaae12166c7bc73a87d` | **success** (watched to completion, exit status 0) |

The single job is `Monorepo Verification & Safety Gates`, which runs `pnpm install --frozen-lockfile`, `pnpm audit --audit-level=high` and **`pnpm verify`** — i.e. `build` + `ui:check` + `lint` + `gen:sdk:check` + `test` + `build:web`. `Promote verified dev to main` is a separate job and was not run by these pushes.

Two limits worth stating before anyone reuses this as release evidence:

1. `pnpm verify` does **not** include `pnpm typecheck` (the root `-r typecheck`). Per-app typecheck was run directly instead: `pnpm --filter @moonwitness/dock typecheck` clean at `7f1c06d` and at `eb26cd5`.
2. Green CI on `dev` is not deployment evidence, and per the gate's own wording it is "a mandatory pre-release gate, not a promise all app ideas can ship".

## 4. Status

- **UI2-G00: satisfied as a side effect of the same evidence.** Its DoD is "synchronize lockfile … test `pnpm install --frozen-lockfile` in a clean workspace, then rerun CI". `@playwright/test` is declared in `package.json` and resolved at `1.64.1` in `pnpm-lock.yaml`, and CI's first step is `pnpm install --frozen-lockfile` on a clean runner checkout — which succeeded at `bd11cf2` and `25bd536`. No `--no-frozen-lockfile` and no removed dependency.
- **UI2-G01: satisfied** — `pnpm lint` passes with 0 errors at exact SHAs `bd11cf2` and `25bd536`, and the specific error ledger above is resolved without disabling lint.
- **UI2-G13: evidence recorded, gate NOT closed.** Its dependency `UI2-G12` (viewport overflow, focus, keyboard, error, offline and fixture-state E2E in the QA matrix) is still open, so closing G13 now would be a checkbox ahead of its own precondition. The green exact-SHA runs above are the part of its DoD that can honestly be banked today.

No canonical `Mxx` row and no `TODO.md` line was touched here.
