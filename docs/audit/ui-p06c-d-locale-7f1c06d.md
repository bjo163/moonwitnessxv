# Relation inspector — id/en locale closure at `7f1c06d`

**Scope:** the two open halves of [todo-ui.md](../../todo-ui.md) **UI-P06c** (typed alias, figure, event and source relation inspector) and **UI-P06d** (relation provenance, alternatives and uncertainty, not invented synonymy) on `apps/dock` route `/[locale]/constellation/relations/[relationCode]`.
**Supersedes:** the "not ticked" verdict in [ui-reader-rail-ab44093](ui-reader-rail-ab44093.md) §6, which held these leaves open for three named reasons. §2 records which of the three this commit closes and which it does not.
**Prior audits:** [ui-screen-audits-d54ad43](ui-screen-audits-d54ad43.md) · [ui-visual-harness-d54ad43](ui-visual-harness-d54ad43.md) · **Rules:** [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md)

## 0. Baseline recorded before committing anything

| Item | Observed |
|---|---|
| Branch | `dev` (no topic branch created, per Owner Policy) |
| HEAD before this work | `bd11cf2` — the branch moved from `17b6777` to `bd11cf2` while this task ran; re-checked immediately before `git add` |
| Working tree | **not clean.** Other sessions' uncommitted files were present throughout (`apps/arsy/src/app.ts`, `apps/arsy/src/modules/channels/index.ts`, `apps/skylink/src/modules/routes.ts`, the `apps/orbit` set, `apps/cockpit` security files, `package.json`, several new `apps/arsy/src/lib/skylink.ts`-class files and other `docs/audit/*`). None were added, modified or committed; the commit used an explicit three-path list |
| Commit created | `7f1c06d7defcdbb3a7bc5049e8ddd1624c27f5a6` — `apps/dock/src/lib/provenance-copy.ts`, `apps/dock/src/ui/components/graph-relation.tsx`, `apps/dock/test/relation-inspector.test.mjs` |
| Commands actually run | `pnpm --filter @moonwitness/dock typecheck`, `pnpm --filter @moonwitness/dock test`, `node --experimental-strip-types --test test/relation-inspector.test.mjs test/provenance-evidence.test.mjs test/unilex-list.test.mjs`, `pnpm ui:check` (via the pre-commit hook), `npx eslint <the three files>`, `git` read/commit only. **No** dev server, `next build`, Playwright run, install, push-to-`main` or deploy |

## 1. The defect these leaves actually had

`ab44093` built the inspector's *semantics*: typed endpoints, per-item uncertainty derived only from projected fields, same-pair alternatives that stay separate claims, and a single shared `SourceEvidence` block. It also made the uncertainty and alternatives halves locale-bound. What it left behind was the detail view around them, which still carried its own English literals. On `/id/constellation/relations/…` the reader therefore saw an Indonesian notice list inside an English table — a UI-F12/parity violation on a public route, and the exact "id/en where appropriate" condition the screen's exit gate names.

Concretely, before this commit [graph-relation.tsx](../../apps/dock/src/ui/components/graph-relation.tsx) contained `kindLabel()` returning `'Candidate claim — not a graph edge'`, `EntityFacts` rendering `role="From"`/`role="To"` and the sentence `Entity … is not part of the ontology projection.`, `releaseLine()` building four English sentences, `<dt>Status</dt>`, `<dt>Epistemic</dt>`, `<dt>Release</dt>`, `<h3>Evidence</h3>`, `<dt>Frame</dt>`, `<dt>Evidence SHA-256</dt>`, `<h3>Review trail</h3>`, `<h3>Release and evidence policy</h3>`, and the badges `VERIFIED BY REVIEWER` / `IN ACTIVE RELEASE` / `NOT IN RELEASE` / `RELEASE MEMBER` as bare strings.

## 2. What this closes, and what it does not

| Reason held open at `ab44093` | Now |
|---|---|
| English-only chrome in the inspector | **Closed** for the inspector: detail view, entity facts, both release badges, both candidate rows, the two notices and the policy list all read from the catalogue |
| No stylesheet hooks | **Never actually missing** — re-measured: the file's 96 `dk-graph-*` classes exist in [globals.css](../../apps/dock/src/app/globals.css), including `.dk-graph-detail-facts`, `-entities`, `-evidence`, `-review`, `-policy`, `-unknown`, `-warning` and a `@media` block at 1877 that reflows `-detail`, `-entities` and `-facts`. `relation-inspector.test.mjs` fails if the component uses a hook that is not already in the stylesheet, so this cannot silently regress |
| No rendering proof | **Not closed here, and not claimed.** Dock tests run under `node --experimental-strip-types`, which cannot compile JSX, so the proof these leaves carry is a source contract plus catalogue parity. Browser-level proof for this route is **UI-P06f**, which remains open and is blocked by the operator's own `next dev` on port 3001 (§5) |

Still English on the same screen, and deliberately **out of scope** for P06c/P06d: `GraphReleasePanel` — the release and candidate-queue panel that belongs to `/constellation` (UI-II **P15**, not this route) — and `CandidateRow`'s compact `frame: … · span: … · SHA: …` meta line. Named here rather than quietly left out.

## 3. Locale work

[provenance-copy.ts](../../apps/dock/src/lib/provenance-copy.ts) gains **57 keys** per locale (53 → 110). Measured on the committed file:

| Check | Result |
|---|---|
| Key parity `en` vs `id` | 110 / 110, identical sorted key sets |
| Keys whose Indonesian value is a copy of the English value | **none** across all 110 |
| Sentences that carry a projected value | Split around it instead of templated: `<code>{relation.epistemicStatus}</code> {copy.unknownStaysUnresolvedSuffix}`, `{copy.releaseActivePrefix} {release.releaseCode}.` — the code or SHA always renders verbatim between two translated halves |
| Status codes | Stay raw: `relation.status`, `relation.epistemicStatus`, `entity.kind`, `relation.kind` are rendered as the hub sent them; only the label around them is translated. An unknown code is never invented or blanked |

## 4. Gates observed at `7f1c06d`

| Gate | Command | Result |
|---|---|---|
| Inspector contract | `node --experimental-strip-types --test test/relation-inspector.test.mjs` | **15 tests / 15 pass / 0 fail** — including the new `UI-P06c the detail half names every rendered row from the catalogue, in the rendered locale`, which asserts every `<dt>`/`<h3>`/badge is `copy.*`-bound **and** that the twelve former literals do not survive in the component (`!viewSource.includes(literal)`, so duplication would also fail) |
| Adjacent provenance suites | `relation-inspector + provenance-evidence + unilex-list` | 31 / 31 pass |
| Dock regression | `pnpm --filter @moonwitness/dock test` | 182 tests, **181 pass, 1 fail** — the failure is environmental, see §5 |
| Types | `pnpm --filter @moonwitness/dock typecheck` | clean (`tsc --noEmit`, no output) |
| Lint | `npx eslint` on the three changed files | 0 problems |
| Token purity | `pnpm ui:check` | 131 files scanned, 0 violations |

The pre-existing `doesNotMatch(/sameAs/)` guard on the alternatives blocks still passes: the new `fieldSameAsPolicy` / `sameAsWarning` keys sit in the detail view, which is where the hub's own `sameAs` policy row already lived.

## 5. Open items this doc does not close

1. **UI-P06f / QA-05 visual proof.** `apps/dock/test/home-offline.test.mjs` fails identically before and after this change: it spawns `next dev`, and Next 16.4.3 refuses because an operator-owned dev server is already bound for this directory — `Another next dev server is already running. Local: http://localhost:3001 · PID 23484 · Dir Z:\project\moonradio\apps\dock`. The server belongs to the operator, so it was not killed. The Playwright harness in `scripts/ui/` captures `home`, `reader`, `terms`, `constellation` and `term-detail`, but **not** the relation-detail route; adding it is P06f work and needs the harness to own its Dock port.
2. **GraphReleasePanel prose** (§2) — belongs to UI-II P15.
3. **UI-P06a** remains an audit row against baseline `d54ad43`; this commit does not re-baseline it.

Nothing in this doc closes an `Mxx` canonical task, and no `TODO.md` row was touched here.
