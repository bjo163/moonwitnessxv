# QA-02 · QA-03 · QA-04 — measured at `ddd58f4`

## 0. Baseline

- Branch `dev`, HEAD at the time of every command below: `ddd58f4` (Dock commits `bb1c98e`, `c2d96a4`, `ddd58f4` on top of `d1a311d`).
- Commands actually executed and observed in this session, all from the repo root:
  - `pnpm ui:check`
  - `pnpm --filter @moonwitness/moonui test`
  - `pnpm --filter @moonwitness/dock typecheck` (run as part of the UI2-G05/G10 verification: `tsc --noEmit`, exit 0)
  - `npx eslint <the seven files changed by the Dock lane>` (0 problems)
  - `node --experimental-strip-types --test <every apps/dock/test/*.test.mjs except home-offline.test.mjs>`
  - read-only greps over `packages/moonui/moon.css`, `scripts/check-ui-consistency.mjs` and the four app stylesheets.
- Not executed here, and why: no `next build` and no `pnpm verify`. A Dock production build writes into the same `.next` directory the operator's own `next dev` server currently holds on port 3001, so running it locally would disturb a session that is not mine. `apps/dock/test/home-offline.test.mjs` was excluded for the same reason — it boots `next dev` on the hardcoded port 3001 and fails environmentally, not because of a code defect. The clean-checkout build is CI's job, and CI runs `pnpm verify` (which contains `build && ui:check && lint && gen:sdk:check && test && build:web`) at the pushed SHA.
- Working tree state respected, not touched: `apps/arsy/src/*`, `apps/skylink/src/modules/routes.ts`, `TODO.md` and `docs/audit/screens/*` belong to other sessions.

## 1. QA-03 — MoonUI suite: SATISFIED

`pnpm --filter @moonwitness/moonui test` → **26 tests, 4 suites, 26 pass, 0 fail, 0 skipped**.

| Suite | Result |
| --- | --- |
| MoonUI Accessibility (WAI-ARIA & Keyboard Navigation) | pass |
| MoonUI Core Primitives SSR Rendering | pass |
| Server-safe button contract | pass |
| MoonUI Design Tokens (Single Source of Truth) | pass |

The DoD names the Dialog/Tab/Field contracts specifically. Those are not assumed — they are asserted, and the assertion density was counted in `packages/moonui/test/`: `Dialog` appears 3× in `accessibility.test.ts`, `Tab` 3× in `accessibility.test.ts` and 3× in `components.test.ts`, `Field` 11× in `accessibility.test.ts`. With the suite green at this SHA there is no regression to any of the three.

**QA-03 can be ticked.**

## 2. QA-02 — token purity: half satisfied, half redefined by the checker

`pnpm ui:check` → **Files scanned: 132 | Total Violations: 0** (also observed as the pre-commit gate on all three commits in this group).

The DoD's second clause is the load-bearing one — *inspect the actual CSS custom-property names rather than trusting the script*. That inspection was done, and it is clean:

| Stylesheet | custom props declared locally | `var(--x)` referenced | referenced but undeclared anywhere |
| --- | --- | --- | --- |
| `apps/dock/src/app/globals.css` | 1 (`--space-tone`) | 20 | **0** |
| `apps/headquarters/src/app/globals.css` | 0 | 7 | **0** |
| `apps/cockpit/client/cockpit-layout.css` | 0 | 9 | **0** |
| `apps/orbit/src/app/globals.css` | 0 | 10 | **0** |

The declaration source is `packages/moonui/moon.css:8` (`:root`) with 38 tokens, and every app imports it (`apps/dock/src/app/layout.tsx:4`, `apps/headquarters/src/app/layout.tsx:3`, `apps/orbit/src/app/layout.tsx:3`, `apps/cockpit/client/main.tsx:2`, `apps/echolog/client/main.tsx:2`). So no app references a custom property that does not exist. On that clause QA-02 is genuinely satisfied.

### What "no token drift" does not mean here

`scripts/check-ui-consistency.mjs:31-57` defines colour drift as a **26-entry blocklist** (`DRIFTED_COLORS`), not as "must equal a declared token". Any hex literal that is not on that list passes, so the green run is weaker evidence than its wording suggests. Measured against the real token values, the app stylesheets contain literal colours that match no token:

- `apps/dock/src/app/globals.css` — 17 distinct hex values: 4 equal a declared token (`#07060b` `--ink`, `#13101d` `--surface`, `#1b172a` `--surface-2`, `#f7f4ec` `--fg`), `#000000`/`#ffffff` are also used inside `moon.css` itself (11× and 26×, for shadows and pure strokes) so they mirror sanctioned usage, and **11 are near-token drift with no token**: `#e6193c`, `#e6006b` (a darkened `--pink`), `#d90429`, `#b50056`, `#241028`, `#1b162a`, `#12101b`, `#110d19`, `#100d19`, `#08060c`, `#050408`.
- `apps/headquarters/src/app/globals.css` — 5 values, of which `#06050a` and `#050408` are the same unlisted drift class (both sit next to `--ink #07060b`).
- `apps/cockpit/client/cockpit-layout.css` — 1 value, `#ffffff`, sanctioned class.

### A second finding: the drift table itself is stale

`DRIFTED_COLORS` documents what it thinks the tokens are, and three of its stated replacements no longer match `moon.css`:

| Checker line claims | `packages/moonui/moon.css` actually declares |
| --- | --- |
| `var(--moon) (#7c3aed)` | `--moon: #9d4edd` |
| `var(--border) (#252038)` | `--border: rgba(247, 244, 236, 0.22)` |
| `var(--muted) (#8e879f)` | `--muted: #9e96b0` |

So the tool's advice strings can tell a contributor to fix a colour *into a value the token no longer has*. That is a one-line-per-entry correction in `scripts/check-ui-consistency.mjs` and it belongs to the MoonUI integrator lane (UI2-G05 scope), not to a QA audit — no file was changed for it here.

**QA-02 is left unticked on purpose.** Its clauses are met as the checker defines them, but ticking "passes with no token drift" while 13 unlisted colour literals sit in Dock and HQ stylesheets would be the kind of claim this repo's evidence rules exist to prevent. The owner decides whether QA-02 is closed on the checker's definition or re-scoped to "every literal colour equals a declared token".

## 3. QA-04 — lint, focused tests, typecheck on exact SHA; build is CI's

Observed locally at `ddd58f4`:

| Gate | Result |
| --- | --- |
| Dock tests (every `apps/dock/test/*.test.mjs` except `home-offline.test.mjs`) | **208 pass / 0 fail** — 184 pre-existing + 10 UI2-G05 + 14 UI2-G10, arithmetic re-verified by sweeping the suite with the two new files excluded |
| `npx eslint` on the changed Dock source, component and test files | 0 problems |
| `pnpm --filter @moonwitness/dock typecheck` | `tsc --noEmit`, exit 0 |
| `pnpm ui:check` | 132 files, 0 violations |
| `pnpm --filter @moonwitness/moonui test` | 26 pass / 0 fail |
| Dock/HQ/Orbit/Cockpit production build | covered by CI at this exact SHA — see below |

CI at `ddd58f4` (run `40485038395`, pushed at 09:59:52Z) reported per job:

| Job | Conclusion |
| --- | --- |
| Monorepo Verification & Safety Gates | **success** |
| Promote verified dev to main | failure — `Confirm dev has not moved and main can fast-forward`, `EXPECTED_SHA: ddd58f45f15b3c07812ffaa5fd5ea8135bc3c4d4`, exit 1 |

The failing job is the promotion guard, and it failed for the correct reason: `fe8e84c` was pushed to `dev` while the run was in flight, so `dev` had moved and `main` could no longer fast-forward to the verified SHA. That is the guard doing its job, not a verification failure. The verification job itself ran `pnpm verify` (`build && ui:check && lint && gen:sdk:check && test && build:web`) on a clean checkout of `ddd58f4` and passed, which supplies the build half QA-04 asks for.

**QA-04 is therefore satisfied at exact SHA `ddd58f4`**: lint 0 errors, Dock focused tests 208/208, MoonUI 26/26, Dock typecheck exit 0, and app builds green in CI at that SHA. The standing limitation is unchanged — a green CI run is verification of a commit, not evidence of a deployment.

One incidental confirmation from reading the root scripts (`package.json` `build`, `build:web`, `verify`, `test`): `pnpm verify` builds arsy, aigateway, sentinel, cockpit, skylink and echolog, then HQ, Dock and Orbit, and its `test` step runs the **full** Dock suite including `home-offline.test.mjs` — which is green in CI. That is direct evidence the local failure is the port-3001 collision with the operator's own dev server and not a product defect.

## 4. Report-only items for the owner

1. `scripts/check-ui-consistency.mjs` claims three token values that `moon.css` no longer has (§2).
2. The drift rule is a blocklist, so new off-token colours pass silently (§2) — 13 instances exist today.
3. `scripts/check-ui-assets.mjs` (the rights ledger checker from UI2-G08) is wired to **no** package script, hook or CI lane, so a served asset with `RIGHTS_UNKNOWN` cannot fail anything.
4. `home-offline.test.mjs` hardcodes port 3001 and therefore fails whenever the operator runs their own dev server; it is not a product defect.
5. Live from the UI2-G02 audit and still open: licensed translation text is reachable through `/orm/research/case` and `/trace` while those endpoints report `rawTextExposed: false`.
