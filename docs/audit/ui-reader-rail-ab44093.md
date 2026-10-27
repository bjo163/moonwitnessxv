# UI reader rail + relation inspector — evidence at `ab44093`

**Scope:** `todo-ui.md` leaves **UI-P05b** (accessible static structure for the CORPUS READER, no fake operational claims) and, as a second commit group, the **UI-P06c / UI-P06d** relation-inspector leaves. **UI-P05e is deliberately left open** — §5 records why.
**Rules:** [ADR-0009](../decisions/ADR-0009-public-ui-reference-adoption.md) · **Prior audits:** [ui-screen-audits-d54ad43](ui-screen-audits-d54ad43.md) · [ui-blocked-screens-8737fe4](ui-blocked-screens-8737fe4.md) · **Harness:** [ui-visual-harness-d54ad43](ui-visual-harness-d54ad43.md) · **Tasks:** [todo-ui.md](../../todo-ui.md)

## 0. Baseline recorded before committing anything

| Item | Observed |
|---|---|
| Branch | `dev` (no topic branch created, per Owner Policy) |
| HEAD before this work | `09bf08c` — three commits landed from parallel sessions during this task; re-checked before each `git add` |
| Working tree | **not clean.** Other sessions' uncommitted files were present throughout: `apps/dock/src/app/reader/compare/page.tsx`, `apps/dock/test/research-public-withholding.test.mjs`, the Headquarters/LUMEN/App-Factory/Sentinel set, and `TODO.md` + `docs/audit/M39-11-operator-console-render.md` **staged in the index by another agent**. None of them were added, modified or committed here; every commit below used an explicit path list |
| Commits created | `44a8640` hub projection + hub tests + regenerated SDK · `f4bf380` Dock reader rail · `ab44093` relation inspector |
| Commands actually run | `pnpm --filter @moonwitness/{moonql-corpus,moonql-client,arsy,dock} build/typecheck/test`, `pnpm exec tsx --test …`, `pnpm gen:sdk`, `pnpm gen:sdk:check`, `pnpm ui:check`, `pnpm exec eslint`, `git` read/commit only. **No** dev server, `next build`, Playwright run, install, push-to-`main` or deploy |

## 1. Why a new projection was needed, and where the boundary stayed

The reader screen had one honest exit for source bytes — `/corpus/reader`, which re-applies the M07-04 rights veto per address — because `corpus_passages` and `corpus_translations` are `ADMIN_FULL`. The reference screen's WORKS/CONTENTS panels therefore had no defensible data source: listing editions, passages or translations from raw ORM would have been a second text exit, and inventing counts from the reader payload would have been exactly the fake operational claim ADR-0009 §2.5 forbids.

The fix stays inside the existing corpus owner: one new metadata-only endpoint `GET /corpus/browse` in [packages/moonql-corpus/src/index.ts](../../packages/moonql-corpus/src/index.ts) (`browse`, `requires: 'public'`), plus Dock rendering of what it returns. No new package, no new ORM table, no new owner, no second Hub.

What the handler guarantees, measured rather than asserted:

| Guarantee | How it is enforced |
|---|---|
| Never a text exit | The handler body contains no read of `arabicText` or `translationText`; `corpus-browse.test.ts` `assertNoTextExit()` checks both the raw response body **and** the projected key set for `arabicText`, `translationText` and the reader's `blockedPlaceholder` on every answer, including the 400 refusals |
| No fabricated inventory | `editions[].passageCount` comes from the engine `count({ editionRef })`, not from a capped scan — a rail printing "500" for a 6,236-row edition is the fake claim P05b forbids. `works[].editionCount` counts within the documented scan |
| Bounded, centred window | `WINDOW_ROWS = 15`, `WINDOW_HALF = 7`, `TRANSLATION_ROWS = 20`, scanned with `WINDOW_SCAN = 500` / `CATALOG_SCAN = 1000`; rows carry identifiers, edition code and `textAvailable` only |
| Rights label, not rights verdict | `isCleared()` is the single `RIGHTS_EXACT_VERSION_CLEARED` invariant; `PUBLIC_DOMAIN` remains a label. `export.textExportAllowed` is a *permitted-class* statement and the sentence still points at `/corpus/reader` for bytes |
| Nothing hardcoded about commentary | `INTERPRETATION: LABELED` is read from the live registry via `ctx.schema()` plus an `orm.model()` probe of the four plausible names, so the reason names the running model count; the test compares it against `moonql.registry` directly |
| Agreement with the reader | Citation normalisation (`trim()` + internal-whitespace collapse), the 60-character cap and the typo second pass mirror `/corpus/reader`, so the rail and the passage cannot disagree about what resolves |

One wording defect found during review and fixed here: for a genuinely cleared edition the reason began **"EXPORT: GUARDED — … so a text export is permitted"**, contradicting its own boolean while the rail rendered both on the same line. The cleared branch now reads `EXPORT: PERMITTED`, and `corpus-browse.test.ts:241-245` pins the prefix and forbids `GUARDED` on that branch; `GUARDED` stays correct for the unresolved-edition and uncleared branches.

## 2. Dock side — what the screen renders now

[apps/dock/src/app/reader/page.tsx](../../apps/dock/src/app/reader/page.tsx) performs **two independent reads** under one `Promise.all`: the passage and the browse projection, each through its own `readPanel` with its own copy and its own `isEmpty` (`browseIsEmpty`). A hub that cannot answer the browse query loses the rail rows and never the passage already on screen; `ReaderRecordRail` then says so with `browseUnavailable`.

- [reader-rail.tsx](../../apps/dock/src/ui/components/reader-rail.tsx) `ReaderContentsRail` — `<nav aria-labelledby>` + five groups (works, editions, passages, translations, export) each with its own heading id. Works and translation rows are **not** links: no defensible target exists for them yet. Edition and passage rows link through `addressHref()` / `localizedDockHref`, so the `/id`·`/en` prefix is written only by the locale seam. `aria-current="true"` marks the address actually on screen. The export row is an anchor to `#reader-citation` **only** when `hasCitationTarget` is true — otherwise it renders the "no target on screen" sentence instead of a dead in-page link.
- `ReaderRecordRail` — a `<dl>` with the five governed statuses (edition, rights, language, interpretation, export) and the hub's `reason` echoed verbatim, so no Dock-side verdict is invented.
- [reader-copy.ts](../../apps/dock/src/lib/reader-copy.ts) — the rail's whole vocabulary under `defineLocaleCatalog`, which throws unless the `en` and `id` key sets are identical, so the two locales cannot drift.
- [globals.css](../../apps/dock/src/app/globals.css) — one `.dk-reader-layout` block (three columns, `minmax(0, 1.7fr) / minmax(210px, 250px) / minmax(220px, 300px)`), collapsing to a single column at the existing 900px query, with a visible `:focus-visible` ring and an `[aria-current]` emphasis. Token colours only; `pnpm ui:check` reports 0 violations.

## 3. Byte-marker integrity — the defect that made a prior absence claim vacuous

`public-projection-denial.test.ts` proves "these bytes did not leave the hub" by asserting a marker is absent from a response body. That proof is worth nothing if the marker no longer equals the stored seed.

While integrating, a pasted Arabic literal was substituted for an agent's `String.fromCodePoint(...)` marker. An in-process probe against the running hub settled it empirically: the reader body **contained the codepoint marker** and **did not contain** the typed literal — through the source round-trip the shadda/fathah cluster reorders. So every absence assertion in that file had quietly become satisfiable by a string that appears nowhere.

Two controls now pin this:

1. `public-projection-denial.test.ts` test 1 asserts, on the successful `/orm/corpus/reader?citation=QS 2:82` response, that `CLEARED_BYTES` **and** `CLEARED_TRANSLATION_BYTES` really are present before any later test is allowed to claim they are absent.
2. `corpus-browse.test.ts` test 1 reads the seed rows in-process (where the ACL does not apply) and asserts the same markers match `corpus_passages.arabicText` and `corpus_translations.translationText`.

Both markers are built with `String.fromCodePoint` and stay ASCII in the source. The file that carried the vacuous marker is the one committed here (`44a8640`), so the committed evidence is the corrected version.

## 4. Gates actually observed (shared worktree, see §0 caveat)

| Command | Result |
|---|---|
| `pnpm exec tsx --test test/corpus-browse.test.ts` | 6 tests · **6 pass · 0 fail** |
| `pnpm exec tsx --test test/public-projection-denial.test.ts` | 15 tests · 14 pass · 0 fail · **1 documented skip** |
| both together | 21 tests · 20 pass · 0 fail · 1 skipped |
| `pnpm --filter @moonwitness/arsy test` (full hub suite) | **tests 370 · pass 360 · fail 0 · skipped 10** |
| `pnpm --filter @moonwitness/dock test` | **tests 181 · pass 181 · fail 0** (adds 13 `reader-static-structure` + 14 `relation-inspector`) |
| `pnpm --filter @moonwitness/dock typecheck` | clean |
| `pnpm --filter @moonwitness/moonql-corpus typecheck` | clean |
| `pnpm exec eslint apps/dock packages/moonql-corpus/src/index.ts apps/arsy/test/corpus-browse.test.ts apps/arsy/test/public-projection-denial.test.ts` | **0 errors**, 3 warnings — all pre-existing `@typescript-eslint/no-non-null-assertion` in `apps/dock/src/data/queries/catalog.ts:51`, not files touched here |
| `pnpm ui:check` | **Files scanned: 114 · Total Violations: 0** (also runs as the pre-commit gate on all three commits) |
| `pnpm gen:sdk` → `pnpm gen:sdk:check` | `generated SDK is up to date`; live `SCHEMA_HASH` moved `403e3a8f11173824` → **`0cc0e2877a5fe31c`** and `schema-history.json` gained one additive entry (no major bump) |

Two findings about this workspace worth keeping, because they cost a full false-failure cycle each time they are forgotten:

- `apps/arsy` tests resolve `@moonwitness/moonql-corpus` and `@moonwitness/moonql-client` to their **`dist/` build**, not `src/`. A package edit or a `pnpm gen:sdk` is invisible to a test run until that package is rebuilt — `moonql-compat.test.ts` "the committed SDK agrees with the live contract" fails with a stale-hash diff that looks like a contract break but is a build artefact.
- `tsx` is only a devDependency of `apps/arsy`; `pnpm exec tsx` from the repository root fails with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`.

## 5. UI-P05e stays unticked — what the negative matrix found instead

The DoD reads "unapproved D08 projection denied even when UI link guessed". Two parts of that sentence cannot be closed yet.

**D08 does not exist.** The registry has no `release_manifests`, `rights_approvals`, `editorial_signoffs` or `takedown_logs` model and no `governance` addon, so there is no approval field to deny with. The reader publishes cleared text on the rights invariant alone. A denial test written against it would be vacuous by construction; `test.skip` documents that instead of faking a green row.

**Four surfaces are demonstrably permissive today**, each pinned by a passing test that asserts the *leak* so a future fix cannot silently regress:

| Surface | Observed |
|---|---|
| `GET /orm/unilex/term` | public projection that skips the `APPROVED_FOR_CITATION` filter its sibling `/unilex/terms` applies — admin-only UNILEX audit rows are readable anonymously |
| `GET /graph/relation` | serves an unreviewed `PENDING` candidate to an anonymous caller |
| `GET /ontology/constellation` | publishes the reviewer queue that `/ontology/conflicts` guards |
| `GET /orm/research/case` + `/orm/research/trace` | **CONFIRMED licensed-translation leak**: licensed wording reaches anonymous callers through `research_claims` / `research_witnesses` while `corpus_translations` itself is `ADMIN_FULL` |
| raw REST reads under `ADMIN_WRITE` | `ADMIN_WRITE` does not imply read-denied, so a model with only write protection serves public GETs — the class of hole above is a policy shape, not one bug |

The guessed-link half of P05e **is** covered for the corpus and unilex-citation paths: malformed, injection-shaped, id-guessed and edition-guessed citations return `absent` with `arabic: null`, `candidates: []`, `translations: []`, never a 500 and never bytes. That is recorded in the file; it is not sufficient to tick the line while the five rows above stand.

## 6. UI-P06c / UI-P06d — implemented, not yet ticked

`ab44093` adds the typed relation inspector and same-pair alternatives: typed relation kind and `relationType` + perspective, direction as recorded, endpoint kinds read from the projection (`fromEntity.kind → toEntity.kind`, `UNRECORDED` outside the projection), asserted-by, reviewer, release line, an itemized Uncertainty section derived only from projected fields, and `RelationAlternativesView` fed by `readSamePairRelations()`, which reuses the curated `/graph/overview` candidate list only — no raw ORM, no new endpoint. Both pair orientations are matched, the inspected code is excluded, and nothing folds an alternative into a synonym or identity claim. Empty and unresolved cases are stated in words; the projection's limit is stated rather than hidden.

Not ticked yet, honestly:

1. No rendering proof exists at these SHAs — the Playwright/visual leaves (**UI-P05f / UI-P06f**) are still open, and this task did not start a dev server.
2. `RelationDetailView` keeps **English-only shipped labels** (`Status`, `Epistemic`, `Release`, `Evidence`, `Review trail`, `Frame`, `Evidence SHA-256`, …) that predate this change; only the newly introduced keys are bilingual. Until that panel's chrome is localized, the id/en parity claim on this screen is partial.
3. `globals.css` was intentionally not extended by the inspector (single-owner file in a shared worktree); the uncertainty and alternatives sections reuse existing `dk-graph-*` rules.

## 7. Limits of this evidence

Source contracts and an in-process hub, not pixels. These suites prove the data path, the rights labels, the locale wiring and the wording sources; they do not prove layout, contrast, focus order or keyboard behaviour in a real browser — those need the harness in §6.1 of [ui-visual-harness-d54ad43](ui-visual-harness-d54ad43.md), which must be re-run after these Dock edits land. `pnpm verify` end-to-end, PostgreSQL parity, CI and any promotion to `main` were **not** executed here and are not claimed.

## 8. Items for the owner (reported, not fixed here)

| Item | Where | Why it needs a decision |
|---|---|---|
| Licensed-translation leak via research routes | `/orm/research/case`, `/orm/research/trace` | A public projection publishes text the corpus owner marks `ADMIN_FULL`; closing it touches M34/M19-19 scope, not this screen |
| `ADMIN_WRITE` permits public reads | `packages/moonql/src/*` ACL resolution | Policy shape affects every addon that uses `ADMIN_WRITE`; a blanket change could break HQ |
| `/reader/compare` asserts `RIGHTS_CLEARED` in code | `apps/dock/src/app/reader/compare/page.tsx` | Flagged as the most serious shipped defect in the `d54ad43` audit; the file is under another session's M19-19 rewrite right now, so it was left untouched |
| UI-P05d "term navigation" is ticked without a reader→`/terms` link | `todo-ui.md:114` | The checkbox claims something the code does not do; correcting status is the owner's call |
| 9 blocked ADR-0009 §2.5 screens, 30 `RIGHTS_UNKNOWN` assets, 2 SVG accessible-name failures, 1440px Dock header overflow | [ui-blocked-screens-8737fe4](ui-blocked-screens-8737fe4.md) | Rights/asset decisions and a layout decision, none resolvable inside this leaf |
