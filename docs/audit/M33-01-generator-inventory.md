# M33-01 — Generator and HQ Story inventory audit

**Task:** M33-01 — Inventory existing generator and HQ Story plans
**Status:** leaf artifact complete; **not self-approved** — integrator review required
**Baseline commit:** `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` (`git rev-parse HEAD`)
**Branch:** `dev`
**Worker:** Qoder leaf agent (M33-01)
**Reviewer:** not assigned
**Result SHA:** left to the integrator (all three files are new and uncommitted)
**Canonical state:** [TODO.md](../../TODO.md) — this audit does not edit or check any TODO row.

## 1. Files

| Kind | Path |
|---|---|
| Inventory ledger | `docs/data/M33-01-generator-inventory.json` |
| Validator | `scripts/check-m33-01-generator-inventory.mjs` |
| Audit (this file) | `docs/audit/M33-01-generator-inventory.md` |

Claimed and actual changed files are these three. No existing file was edited, staged, reverted or deleted. No commit was created.

## 2. Scope and method

Read-only inspection of the real tree at the baseline commit:

- `apps/dock/src/app/studio/page.tsx` and `apps/dock/src/ui/client/GeneratorStudio.tsx` (the only studio generator entry point found).
- `packages/moonui/src/avatar/generator.tsx`, `packages/moonui/src/avatar/prng.ts`, `packages/moonui/src/seal.tsx` (generator primitives).
- `apps/headquarters/src/app/(admin)/page.tsx` (HQ Story Forge / Poster Lab cards).
- `TODO.md` (M17 and M33 rows), `BLUEPRINT.md` (SHADOW and D07 rows), `todo-ui.md` (UI-P03/UI-P04 plans).
- `docs/design/mockups-xv/manifest.json` and `docs/design/ASSETS.md` (reference media and rights gate).
- `docs/audit/ui-p02-p12-audits-fe8e84c.md` (prior route, data-owner and absence audit).
- `scripts/check-ui-assets.mjs` (asset gate).

The ledger contains 41 rows. Each row cites one `file:line` whose quote must occur verbatim on that line. The validator enforces the following invariants:

1. Quote resolution at the cited `file:line`.
2. Declared tallies equal the actual row counts and status sum.
3. Every `IMPLEMENTED` row cites executable source (`.ts`, `.tsx`, `.mjs`, `.js`, etc.).
4. Every `PLANNED` or `ABSENT` row cites non-executable planning, manifest or audit evidence.
5. A `PLANNED` row cannot claim a built/live/complete state in its text.
6. Source paths are repo-relative, non-escaping, outside build output, and actually exist.
7. Row ids are unique and required fields are present.

## 3. Commands actually executed

| Command | Observed output | Exit |
|---|---|---|
| `git rev-parse HEAD` | `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` | 0 |
| `git branch --show-current` | `dev` | 0 |
| `git status --short \| head -50` (start) | Pre-existing modifications from another session, including `apps/cockpit/client/App.tsx`, `apps/headquarters/src/app/(admin)/page.tsx`, `.env.example` and `docs/audit/screens/*.png`; nothing staged. | 0 |
| `node --version` | `v24.22.1` | 0 |
| `node scripts/check-ui-assets.mjs` | `Assets scanned: 33 \| SVG: 3 \| raster: 28 \| audio/video: 2 \| font: 0 \| ledger rows: 33`; `Total Violations: 32`; `violations_rights=30`; `UI asset pipeline check FAILED with 32 violation(s).` | 1 |
| `grep -rn --include=package.json --exclude-dir=node_modules '"ui:assets"' .` | no matching lines (`grep_exit=1`); `test -f scripts/check-ui-assets.mjs` printed `script_exists=yes` | 1 |
| `node scripts/check-m33-01-generator-inventory.mjs` | `M33-01 inventory check: PASS`; `rows=41 implemented=12 planned=16 absent=10 needs_source=3` | 0 |
| `node scripts/check-m33-01-generator-inventory.mjs --self-test` | `M33-01 self-test: PASS`; valid fixture accepted; quote drift, status upgrade, tally drift and fabricated path each rejected | 0 |
| `git status --short --untracked-files=all \| grep "M33-01"` | `?? docs/data/M33-01-generator-inventory.json` (validator and this audit were added afterwards) | 0 |
| `git diff --cached --stat \| wc -l` | `0` (nothing staged) | 0 |
| `git diff --stat \| tail -3` | Pre-existing working-tree diff only, e.g. `64 files changed, 1864 insertions(+), 2961 deletions(-)`; no M33-01 tracked file appears. | 0 |

File inspection used the Read/Grep tools rather than shell `cat`; those reads are the source of the line numbers in the ledger and were re-checked by the validator's quote resolution.

## 4. Inventory summary

| Status | Rows |
|---|---|
| `IMPLEMENTED` | 12 |
| `PLANNED` | 16 |
| `ABSENT` | 10 |
| `NEEDS_SOURCE` | 3 |
| **Total** | **41** |

### What exists

- A public Dock `/studio` route renders `GeneratorStudio` (`apps/dock/src/app/studio/page.tsx:12`).
- The generator is deterministic client-side SVG, not a story or poster generator: `MoonAvatar`, `StationSeal`, a 20-icon glyph catalog and a Mulberry32-style PRNG.
- Real exports exist: clipboard SVG, `.svg` download and 1024 px canvas PNG export.
- HQ renders Story Forge and Poster Lab dashboard cards, but they are navigation only (`/models` and `/views`).
- A dependency-free asset gate script exists and runs, but the tree is red with 32 pre-existing violations.

### What is planned

- M17-03 story world/arc/episode/scene/version graph; M17-05 SHADOW HQ editor; M17-06 poster/media licenses.
- M33-03 scene version/media rights, M33-04 single renderer/HQ handoff, M33-05 private poster access.
- UI-P03 Story Forge and UI-P04 Poster Lab leaves; D07 Story & Media boundary; proposed `apps/shadow`.
- Story Forge and Poster Lab reference mockups are `CONCEPT_ONLY` / not deployed.

### What is absent

- No `stories`/`scenes`/`arcs`/`episodes` data models and no `packages/moonql-story*` addon.
- No story editor route in Dock or HQ; the HQ Story Forge card points at the generic model registry.
- No `scene_versions` table, rights store or review queue.
- No poster/media manifest model, canvas, layer stack or selected-object model; no end-to-end poster pipeline.
- No rights/consent/approval step on the existing export path.
- No auth boundary on `/studio` (public Dock demo); no SHADOW app code.
- The documented `pnpm ui:assets` entry point is absent from every `package.json`; only `scripts/check-ui-assets.mjs` exists and must be invoked directly with `node`.

## 5. Positive evidence

```
$ node scripts/check-m33-01-generator-inventory.mjs
M33-01 inventory check: PASS
  rows=41 implemented=12 planned=16 absent=10 needs_source=3
exit=0
```

This proves all 41 locator quotes resolve at their cited `file:line`, all source paths exist, status/source-kind invariants hold, and declared tallies equal the rows.

## 6. Negative evidence

```
$ node scripts/check-m33-01-generator-inventory.mjs --self-test
M33-01 self-test: PASS
  valid fixture accepted
  quote drift rejected (QUOTE_MISMATCH)
  PLANNED-to-IMPLEMENTED upgrade rejected (SOURCE_NOT_EXECUTABLE)
  tally drift rejected (TALLY_MISMATCH/TALLY_SUM)
  fabricated path rejected (PATH_MISSING)
exit=0
```

The self-test builds tampered in-memory copies of the real ledger (no fixture files are written): a changed quote, a `PLANNED` row upgraded to `IMPLEMENTED` while still citing a document, a reduced total, and a nonexistent source path. Each is rejected with the expected error code, and the untampered ledger is accepted.

Independent observed negative evidence from the tree: the asset gate fails with 32 violations (exit 1), consistent with the rights rows; `/studio` is public with no auth boundary; the export handlers contain no approval check.

## 7. Rights, privacy and security notes

- Only minimal locator quotes are reproduced; no copyrighted narrative text, lyrics, artwork or private witness material is copied.
- The mockup manifest declares `licenseReviewRequired: true` and reference-only PNG use. No completed rights review was found, so media production use is `NEEDS_SOURCE`, not approved.
- `pnpm ui:assets` is not wired, and the underlying gate is red (30 rights-unresolved served assets at the observed run). This inventory does not certify any served media.
- `/studio` is an unauthenticated public Dock route. No private poster access, consent store or approval workflow is claimed.
- No secrets, `.env` values, credentials or personal data were read into or written by this task.

## 8. Rollback

Delete the three new files:

```
docs/data/M33-01-generator-inventory.json
scripts/check-m33-01-generator-inventory.mjs
docs/audit/M33-01-generator-inventory.md
```

No tracked file, `TODO.md` row, dependency, build output or configuration was changed by this task, so deletion fully restores the pre-task tree apart from the concurrent session's own edits, which this task did not touch.

## 9. Limitations

- The working tree was already dirty from a concurrent session at task start. Quotes were resolved against the working tree at check time, while `baseline_sha` is the commit `891bf5e`. If the concurrent edits move those lines, the validator must be re-run before integration.
- Absence claims rely on the cited prior audit plus targeted searches for story/scene/poster model, route and package names. They are not an exhaustive database introspection; no database was queried.
- No browser, dev server, Docker, database or deployment was run. No visual, keyboard or responsive behavior is claimed.
- The 32 asset-gate violations are pre-existing and unrelated to M33-01; they are reported only as media-rights context.
- Typecheck was not applicable: no TypeScript product source changed. The only executable addition is the dependency-free Node ESM validator, exercised directly.
- `result_sha` is intentionally unset; the integrator owns the commit and the exact-SHA evidence check. The next eligible task is M33-02 after M33-01 integration; M17-03 remains open.

**Report fields:** `task_id` M33-01 · `baseline_sha` `891bf5e19edbbea3d5e5ada36a7b126f35fabf94` · `worker` Qoder leaf agent · `claimed_files` 3 · `actual_changed_files` 3 · `positive_test_and_output` validator PASS, 41 rows / 12 implemented / 16 planned / 10 absent / 3 needs-source, exit 0 · `negative_test_and_output` self-test PASS, 4/4 tampered fixtures rejected, exit 0 · `reviewer` unassigned · `rollback` delete the three new files · `result_sha` integrator-owned · `limitations` dirty concurrent working tree, no DB/browser/deployment evidence · `next_eligible_task` M33-02.
