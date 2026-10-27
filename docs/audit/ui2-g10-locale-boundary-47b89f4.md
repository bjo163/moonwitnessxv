# UI2-G10 · Dock locale vs source-language boundary and catalogue coverage

Gate: `todo-ui-2.md` **UI2-G10** — `| [ ] | **UI2-G10** | P1 | D3 | G01,G05 | i18n owner | apps/dock/src/lib; reader/terms/Denpa pages | Audit Dock locale vs source lang/dir boundaries and catalog coverage outside homepage. **DoD:** id/en per UI, source script retains its own dir; missing-key tests. |`

Note on the assignment: the row is at **`todo-ui-2.md:39`**, not line 36, and its dependency column reads **`G01,G05`** — UI2-G05 is still `[ ]` at this baseline.

---

## 0 · Baseline and what was actually run

| Item | Observed value |
| --- | --- |
| Branch | `dev` (no new branch created, per Owner Policy) |
| HEAD at start | `7d2e9d8877407f6409ee9663d1222620e1628578` — `feat(orbit): gate approval handoff on a server-validated 100CENTER surface (M40-08)` |
| HEAD named in the assignment | `47b89f4` — present in history as `HEAD~1`, `docs(audit): record packet-1 rights, preview-security and asset-origin audits`. The baseline moved by one commit before this gate started; this file keeps the assigned `47b89f4` suffix so the owner finds it where it was promised, and every command below was executed against `7d2e9d8`. |
| Working tree at start | Foreign uncommitted changes present and preserved: `apps/arsy/*`, `apps/orbit/*`, `apps/skylink/*`, `docs/audit/M40-07-*`, `docs/audit/screens/*`, `TODO.md`, plus untracked `apps/arsy/src/lib/skylink.ts`, `apps/arsy/test/skylink-client.test.ts`, `docs/audit/M38-12-*`. A concurrent agent was editing `apps/dock/src/app/globals.css` and `apps/dock/src/ui/components/shell.tsx` (UI2-G05); both were left untouched. |

Commands executed (all against the tree above, from `Z:\project\moonradio`):

```text
$ git rev-parse --abbrev-ref HEAD            -> dev
$ git rev-parse HEAD                         -> 7d2e9d8877407f6409ee9663d1222620e1628578   (at start)
$ git status --short                         -> (foreign changes listed above; none authored here)
$ git log --oneline -15                      -> 7d2e9d8 … 47b89f4 (parent) …
$ git rev-parse HEAD                         -> 39a7e2733509d88f5e9e56b13d85c4277d72edf9   (at final verification)
$ node --experimental-strip-types --test test/locale-boundary-coverage.test.mjs
$ node --experimental-strip-types --test <every test/*.test.mjs except home-offline>
$ npx tsc --noEmit                                                 (in apps/dock)
$ pnpm exec eslint <the four lintable files this gate touched>     (from the repo root)
$ pnpm ui:check                                                    (from the repo root)
```

The tree moved while this gate ran: HEAD advanced from `7d2e9d8` to `39a7e27` (`fix(hq): render server login checkbox without handler`, authored by another session), and the concurrent UI2-G05 agent landed both `apps/dock/src/app/globals.css`/`shell.tsx` and its new `test/header-shell-no-clip-contract.test.mjs`. Every result quoted in §4 is from the final run against `39a7e27`, with this gate's own changes on top; none of those foreign files were touched here.

`home-offline.test.mjs` was **excluded on purpose**: it drives the Dock on port 3001, which the operator's dev server holds (`apps/dock/package.json` `dev: "next dev -p 3001"`); running it would test the operator's process, not this change. Not run, and why: `pnpm verify` and `pnpm test` at the root (they start other apps' suites and the offline case above), `pnpm build`/`build:web` (out of scope for a P1/D3 audit gate), `pnpm --filter @moonwitness/dock dev` and anything under `scripts/ui/*` (explicitly forbidden; no server started, no `docs/audit/screens/` evidence written), Playwright (no browser harness is wired for these routes), and every git write operation (`add`/`commit`/`push`/`stash`/`checkout`/`restore`/`clean`/`reset`). No hub, database or network call was made; every claim below is from reading files or from the two suites above.

## 1 · The boundary as built: UI locale vs source language

Two independent axes exist and must not be merged:

1. **UI locale** — `id` or `en`. Negotiated in `src/middleware.ts:30-37` (root) and `:45-59` (prefix rewrite), forced into a request-only header at `src/middleware.ts:97-104` (`pageRequestHeaders` overwrites a client-supplied `x-mw-locale`), read back only through `localeFromMiddlewareHeader` (`src/lib/locale-context.mjs:13-15`), and printed as the document language at `src/app/layout.tsx:27` (`<html lang={locale}>`) and `src/app/global-error.tsx:24`.
2. **Source language / direction** — a property of the *data*, projected by the hub, and it must be carried on the element that renders it.

Both UI locales are LTR, so the Dock deliberately sets no `dir` on `<html>`; `dir` therefore exists **only** as a source attribute. `grep -rE '<(p|span|div|dd|li|pre)\b[^>]*dir="(ltr|rtl)"' src` over all 51 Dock source files returns nothing: no text element pins a direction, which is what keeps the boundary honest. (`<Chevron dir="right" />`, e.g. `src/ui/components/terms.tsx:196`, is a MoonUI icon-direction prop, not the HTML `dir` attribute, and must not be read as attribution.)

### 1.1 Spans that do hold the line (attributed, and attributed from a projected field)

| Surface | Element | `lang` from | `dir` from | Projection declaration |
| --- | --- | --- | --- | --- |
| Terms / `/terms/[stableId]` form chips | `src/ui/components/terms.tsx:55` | `form.languageCode` | `form.direction` | `src/data/queries/terms.ts:9-18` — `TermForm.direction: 'ltr' \| 'rtl'` |
| Terms match-preview surfaces | `src/ui/components/terms.tsx:220` | `side.language ?? undefined` | `side.direction` | `src/data/queries/terms.ts:152-153` — both sides carry `direction` and `language: string \| null` |
| Constellation aliases | `src/ui/components/constellation.tsx:60` | `alias.languageCode` | `alias.direction` | `src/data/queries/constellation.ts:18-29` — `GraphAlias.direction: 'ltr' \| 'rtl'` |
| Reader source passage | `src/ui/components/reader.tsx:186` | `result.arabic.language` | `result.arabic.direction` | `src/data/queries/reader.ts:35-40` — `ReaderArabic.direction: 'rtl'` (the corpus states the direction; the Dock only echoes it, and `reader.tsx:190` prints the script and direction verbatim as evidence) |

The row that renders a metadata-only `null` language (`side.language ?? undefined`) is correct: no `lang` is emitted rather than a guessed one, while `dir` still comes from the projection.

### 1.2 GAP-DENPA-UNATTRIBUTED — witness text with no language field to attribute from

- The Denpa feed renders public message text at `src/ui/client/DenpaTransceiver.tsx:198-200`: a `<p>` with inline styles only, then `{t.message}`. No `lang`, no `dir`, so an Arabic or Hebrew transmission inherits the document's LTR ordering.
- The reason is a hub contract, not a Dock omission. The row type is owned by the generated MoonQL client, `packages/moonql-client/src/generated.ts:2152-2160` (`PublicLiveTransmissionsOutput`): `id`, `pseudonym`, `message`, `stationRef`, `status`, `broadcastAt`, `stationRefRecord`. There is **no** `language`, `script` or `direction` field anywhere in it, and `apps/dock/src/data/queries/denpa.ts:16-21` forwards that type unchanged.
- Consequence and rule: the Dock cannot state a direction it does not have, and adding a script-detection heuristic would make the UI claim something the projection never said. So this is reported as a contract gap for the owner (D06 / denpa transmission row), pinned by the test with two clauses — the span stays unattributed *and* the component is forbidden from growing a detector (`\p{Script=Arabic}`, `\p{Script=Hebrew}`, `Intl.Locale`, `getComputedStyle`, `isRTL`). The narrow honest rule: *a source span is attributed if and only if the projection carries the field.*

### 1.3 GAP-READER-TRANSLATION-DIR — a direction the Dock infers from one language literal

- `src/ui/components/reader.tsx:224` renders a licensed translation row as `<p lang={row.languageCode} dir={row.languageCode === 'ar' ? 'rtl' : 'ltr'}>`.
- `src/data/queries/reader.ts:26-33` (`ReaderTranslation`) projects `languageCode` but **no** `direction`. The `lang` half of the DoD therefore holds (the code is projected); the `dir` half is a Dock-side derivation from a single literal comparison. It is right for the Arabic rows the corpus returns today and **wrong for any other right-to-left translation** — a Hebrew translation would print `dir="ltr"`.
- This is the only such site in the app: `? 'rtl' : 'ltr'` occurs exactly once across all 51 Dock source files, and the test pins that count so a second guess cannot appear quietly. The correct fix is a `direction` field beside `languageCode` in the `/corpus/reader` translation row — the same shape `/unilex/terms` already ships (`TermForm.direction`) — not a wider heuristic here.

### 1.4 Lower-severity attribution findings (no dir violation; report-only)

- Registry label pairs `preferredEn` / `preferredId` (`src/data/queries/terms.ts:94-95`, rendered at `src/ui/components/terms.tsx:171-175` and `src/ui/components/constellation.tsx:84-87` as `labelEn` / `labelId`): the language of each label is encoded in the *field name*, not emitted in the DOM, so an Indonesian page prints the English registry label with no `lang="en"`. Both values are Latin-script, so direction is unaffected; the missing piece is a `lang` attribute the Dock is already entitled to write, because the hub named the language in the schema.
- `src/ui/components/terms.tsx:62` marks a transliteration `lang="en"`. Romanisation is not English; the attribute mislabels the language it is transliterating. `dir` is unaffected.
- Hub prose shown verbatim — `terms/page.tsx:110` (`registry.notice`), `reader-rail.tsx:296,307` (`interpretation.reason`, `export.reason`) — is deliberately untranslated (the rail's own comment: the hub keeps its own explanation). It is English UI-visible text on an `/id` page with no `lang`. That is a product decision to confirm, not a bug to fix inside G10.

## 2 · Catalogue inventory and coverage outside the homepage

Four `defineLocaleCatalog` catalogues exist under `apps/dock/src/lib`, discovered by the test rather than by memory (`src/lib/landing-copy.ts:4`, `src/lib/provenance-copy.ts:18`, `src/lib/reader-copy.ts:12`, `src/lib/states-copy.ts:4`). `defineLocaleCatalog` (`packages/core/src/locale.ts:30-43`) throws on any id/en key-set difference at construction time and freezes both locales, so a key can never be added to one language alone at runtime.

| Catalogue | Keys/locale | Surface it owns |
| --- | --- | --- |
| `landing-copy` | 108 | homepage `/`, plus the space and section vocabulary under `src/ui/components/sections.tsx`, `spaces.tsx` |
| `states-copy` | 127 | the four-state contract (`readPanel` / `OutcomePanel` / `PanelState` in `src/ui/components/states.tsx`, via `getStatesCopy`) plus form, player, boundary and empty-state sentences for every data route |
| `provenance-copy` | 110 | the shared evidence vocabulary: `SourceEvidence` (`src/ui/components/provenance.tsx:35-74`), `rightsLabel`, `reviewLabel`, the relation inspector |
| `reader-copy` | 38 | the Reader's contents rail and reading record (`src/ui/components/reader-rail.tsx`), plus the unresolved-edition fallback |

Per-route coverage (route → catalogues reachable from it → residual hardcoded English). Counted from `title|subtitle|label|hint|placeholder|aria-label="…"` attributes plus JSX text nodes in the route file and the views it renders; `0` means no residual UI sentence was found, not "the route is perfect".

| Route | Catalogue-driven part | Residual hardcoded English (file:line) |
| --- | --- | --- |
| `/reader` | `states-copy` (panel states + now the citation form) and `reader-copy` (both rails) | `reader/page.tsx:69` `title="Corpus Reader"`, `:70-76` subtitle sentence, `:91` `title="Look up a citation"`, `:92` subtitle, `:77` breadcrumb labels `Home`/`Reader`; `reader.tsx:29,35,41,44,47,50,53,69,72` nine `<dt>` labels in the source-identity table, `:169-183` three block headings, `:235-250` citation panel title/subtitle/hint, `:157,190,214` `RIGHTS CLEARED`/`UNKNOWN WORK`/`UNKNOWN LICENSE` fallbacks |
| `/terms` | `states-copy` (panel states, all filter fields) + `provenance-copy` (source rows, review labels) | `terms/page.tsx:99-101` header title/subtitle/breadcrumbs, `:107` Registry panel, `:113-129` five `<dt>` registry labels, `:140` filter panel, `:208-209` match-preview panel; `terms.tsx:49` `aria-label="Written forms"`, `:62` `transliteration:` prefix, `:67` `more forms`, `:114-128` eight `DataTable` column labels, `:134` `Table index · … of … terms on this page`, `:142-143` index empty state, `:179` `MATCH n%`, `:190-197` count sentence + `Read term`, `:212-241` match-preview sentences, `:273,278,311` section headings, `:317-374` aside panel titles |
| `/terms/[stableId]` | none in the page itself; `TermDetailView` reaches `provenance-copy` + now `states-copy` | `terms/[stableId]/page.tsx:26-33` header subtitle and `Home`/`Terms` breadcrumbs; plus every `terms.tsx` residual above |
| `/denpa` | `states-copy` (feed panel states and the whole transceiver form, `DenpaTransceiver.tsx:78-177`) | `denpa/page.tsx:48-50` header title/subtitle/breadcrumbs, `:53-54` `on-air`/`target stations` badges; `DenpaTransceiver.tsx:113-172` two panel titles/subtitles, `:131` `n / 500`, `:187-208` `RECENT`, `ON-AIR`, `Station:`, `Global` |
| `/constellation` | `states-copy` page states; relation rows via `provenance-copy` | `constellation/page.tsx:64-65` header; `constellation.tsx:55` `No alias is recorded.`, `:57` `aria-label="Aliases"`, `:64-69` meta words (`reviewer:`, `evidence:`), `:199,233,256,291-292,303,315,329` panel titles/subtitles and `<dt>` labels |
| `/constellation/relations/[code]` | `states-copy` + `provenance-copy`, row by row | none found — this surface was migrated under UI-P06c/P06d and is the model the rest should follow (`relation-inspector.test.mjs` asserts it key by key) |
| `/stations`, `/stations/[id]`, `/schedule` | `states-copy` for panel states | `stations/page.tsx:66,75`; `stations/[id]/page.tsx:37` `Back to catalog`, `:45,53-63` eight `StatCard`/panel labels |
| `/figures`, `/missions`, `/figures/[code]` | `states-copy` for panel states | `figures/page.tsx:26-27`; `missions/page.tsx:73-88`; `actors.tsx:100-537` — dozens of `<dt>`, panel titles and empty-state sentences, of which four (`emptyFiguresRegistry`, `emptyFiguresRegistryHint`, `emptyMissionsFilter`, `emptyMissionsFilterHint`) already exist in `states-copy` and are typed out again |
| `/patches`, `/research`, `/prisms`, `/studio`, `/timeline`, `/embed/[id]` | `/patches` + `/research` use `states-copy` panel states | `patches/page.tsx:43-44`; `research/page.tsx:23-24`; `/prisms`, `/studio`, `/timeline` are authored static screens with their own prose and no catalogue at all |
| `/` (homepage, excluded from the DoD but kept for contrast) | `landing-copy` (108 keys) + `states-copy` | `page.tsx` is the only Dock route with zero residual label attributes found by this scan |

Catalogue keys that exist in both locales but are named by **no** Dock source: 27 of 127 in `states-copy` at the start of this gate. Seven were the Reader's own form labels — now wired (see §2.1). The remaining 20 are the owner's decision, listed in §5.

### 2.1 Wiring actually performed (no new copy authored)

Every change below consumes a key that already existed in both locales with the **same English text** that was being typed out, so an `/en` page renders byte-identically and an `/id` page stops showing English.

| File | What was wired | Key source |
| --- | --- | --- |
| `src/app/reader/page.tsx:82,95-108` | citation label/hint/placeholder, edition label/hint, submit button, comparative-workbench CTA | `states-copy` `formCitation`, `formCitationHint`, `formCitationPlaceholder`, `formEdition`, `formEditionHint`, `formReadSource`, `formComparativeWorkbench` (all already in `test/required-states-ui-keys.mjs`) |
| `src/ui/components/terms.tsx:14,44-47,155-159,248,280` | form-chip empty sentence, the two terms empty states, the senses empty sentence; `FormChips` now receives `locale` from both call sites | `states-copy` `emptyFormsRecorded`, `emptyTermsTitle`, `emptyTermsSubtitle`, `emptyTermsSearchTitle`, `emptyTermsSearchHint`, `emptySensesRecorded` |
| `src/ui/components/reader.tsx:6,10,24-26,64,96-97,144,163` | provenance-version row label and the four unresolved/UNRECORDED fallbacks | `provenance-copy` `fieldProvenanceSha`, `unrecorded`; `reader-copy` `unresolvedEdition` |

Deliberately **not** done: the residual literals in the table above (Reader source-identity `<dt>` set, terms column labels and headings, Denpa panel titles, constellation/actors vocabulary) would need new copy for two locales on a scale that is a separate task, not a missed key. `test/unilex-list.test.mjs:44-58` also asserts several terms column labels as English literals, so changing them would edit another gate's contract test.

## 3 · What `test/locale-boundary-coverage.test.mjs` pins

Fourteen clauses, source contracts in the style of `relation-inspector.test.mjs`.

1. **Inventory completeness** — every `src/lib/*.ts` that calls `defineLocaleCatalog` must be one of the four asserted here; a fifth catalogue fails until it is audited.
2. **id/en key-set parity** for all four catalogues (asserted independently of the constructor's own throw).
3. **Value sanity** — every value a non-empty string in both locales, no `[TODO]`/`[TBD]`/`undefined` tokens, and an id value identical to its English twin is a failure **unless** it is in the explicit `IDENTICAL_VALUE_EXCEPTIONS` list (`Genre`, `QS 2:82`, `THE SHADOW`, `Global`, `Radar`, `DEMO`) which may shrink but not grow silently.
4. **Missing-key test (the DoD's half)** — `defineLocaleCatalog` is called with a key present in one locale only, in both directions, and must throw `TypeError: Locale catalogs must contain identical keys`; the shipped catalogues are frozen, so no view can patch a locale in at render time.
5. **Key resolution per view** — every `copy.X` / `states.X` / `rail.X` / `provenance.X` written in the eight audited surfaces must resolve in **both** locales of a catalogue that file actually binds (a typo today prints nothing; here it fails). Documented limitation: the binding is per file, not per function, so a file that binds two catalogues accepts a key carried by either — the strict per-block form already exists in `relation-inspector.test.mjs:322-335`.
6. **Document language** — `layout.tsx` and `global-error.tsx` print `<html lang={locale}>` from the shared helper (header for a server render, `clientDockLocale` for a boundary element) and set no `dir` on `<html>`; no text element in `src` pins `dir="ltr"|"rtl"`.
7. **Attribution contract** — the four attributed spans of §1.1 must carry both `lang` and `dir`, and the projection that feeds each must still declare the field it is read from. If the hub drops `TermForm.direction`, this fails rather than silently rendering LTR.
8. **The one inference site** — `ReaderTranslation` must still have `languageCode` and still must **not** have `direction`; `? 'rtl' : 'ltr'` may appear at exactly one file in `src`, and it must be the documented Reader row. Clause retires when the hub projects `direction`.
9. **Denpa gap, kept honest** — the message `<p>` must still have no `lang`/`dir`; `PublicLiveTransmissionsOutput` must still carry neither field; the component must **not** contain a script/RTL detector; and this audit note must exist and name both `GAP-DENPA-UNATTRIBUTED` and `GAP-READER-TRANSLATION-DIR`. A "fix" that quietly adds a detector, or a gap that stops being written down, fails the build.
10. **Locale-prefix rule re-pinned for the gate's own surfaces** — no audited file may contain a `'/id…'`/`"/en…"` literal or interpolate a locale into a path, and across all of `src` the only files that build a `/${locale}` prefix remain `src/lib/locale-context.mjs` and `src/middleware.ts`. This overlaps `test/locale-href-contract.test.mjs` on purpose: a coverage gate must not depend on another gate's suite to stay green.
11. **Locale handoff** — each source-bearing view must be handed `locale={locale}` by its route, including the private `FormChips` that renders headwords.
12. **Reader coverage** — the seven citation-form keys must be rendered from `states-copy`.
13. **Terms coverage** — the six empty-state keys must be rendered from `states-copy`, and the Reader's edition fallback from `reader-copy`.
14. **No duplicate writer** — no audited surface may contain a quoted or JSX-text string that is byte-identical to a catalogue value of eight characters or more. This is the clause that found §2.1's work, and it is the regression guard: a sentence may have exactly one writer.

## 4 · Verdict on the DoD

| DoD clause | Status | Evidence |
| --- | --- | --- |
| "id/en per UI" | **Met for the audited surfaces' label layer only, with named residuals.** Middleware/header/document chain is single-writer (§1.1); the Reader form and the terms/Reader empty-state sentences are now catalogue-bound (§2.1). Wholesale English remains on the Reader source-identity table, the terms column set and headings, the Denpa panel titles, and the constellation/figures/missions vocabulary (§2). That is new copy for two locales, a task of its own, not a missed key. |
| "source script retains its own dir" | **Partly met; BLOCKED on two hub contracts.** Terms forms, term-comparison surfaces, constellation aliases and the corpus passage all take `dir` from a projected `direction` field. The two exceptions are §1.2 (no `language`/`direction` field exists on the Denpa transmission row at all) and §1.3 (`/corpus/reader` translation rows carry `languageCode` but no `direction`, so the Dock infers it for Arabic only). Both need a projection change in `apps/arsy` / the corpus owner; neither can be closed honestly inside the Dock. |
| "missing-key tests" | **Met.** Clauses 2-5 and 12-14 of `apps/dock/test/locale-boundary-coverage.test.mjs`, plus the constructor-level negative test in clause 4. |

Verification actually observed, verbatim from the final runs against `39a7e27` + this gate's changes:

1. New gate test — `cd apps/dock && node --experimental-strip-types --test test/locale-boundary-coverage.test.mjs`:

```text
ℹ tests 14
ℹ pass 14
ℹ fail 0
```

All 14 clauses are named `UI2-G10 …` and each is listed in §3.

2. Full Dock suite, `home-offline.test.mjs` excluded — `node --experimental-strip-types --test <the other 24 test/*.test.mjs files>`:

```text
ℹ tests 208
ℹ pass 208
ℹ fail 0
```

208 = 184 + 14 + 10, verified by re-running the same 24-file sweep with this gate's file and UI2-G05's file removed: `ℹ tests 184 / pass 184 / fail 0`. So the pre-existing contract surface is untouched; the 14 new clauses are this gate's and the 10 in `header-shell-no-clip-contract.test.mjs` are UI2-G05's. At the interim capture the suite read **193 pass / 1 fail**, the single failure being `test/header-shell-no-clip-contract.test.mjs:126` "UI2-G05 globals.css is the single owner of the desktop/drawer switch" — a test, `globals.css` and `shell.tsx` owned by the concurrent UI2-G05 agent and off-limits here. That agent has since landed its fix: running the file alone now gives `ℹ tests 10 / pass 10 / fail 0`. Nothing this gate authored or edited is implicated in either state.

3. Typecheck — `cd apps/dock && npx tsc --noEmit`: **exit 0, no diagnostics**.

4. Lint scoped to this gate's files — `pnpm exec eslint apps/dock/test/locale-boundary-coverage.test.mjs apps/dock/src/app/reader/page.tsx apps/dock/src/ui/components/terms.tsx apps/dock/src/ui/components/reader.tsx`: **exit 0, zero warnings, zero errors** (the audit note is Markdown and is not an ESLint target; the root `lint` script is `eslint .`, so this is the same rule set applied to exactly the four files this gate wrote). This also settled the import-shape question raised while wiring `reader.tsx`: `getReaderCopy`/`getProvenanceCopy` are separate statements, because `test/provenance-evidence.test.mjs:61-65` asserts the literal string `import { rightsLabel } from '@/lib/provenance-copy'`, and that test passes inside run 2.

5. `pnpm ui:check` from the repo root — **exit 0**:

```text
Files scanned: 132 | Total Violations: 0
✨ Monorepo UI consistency check PASSED! All apps are 100% unified with @moonwitness/moonui.
```

Check 1 passes on every Dock surface it inspects, including `shell.tsx` (the concurrent agent's file) — so this gate's edits and UI2-G05's edits do not conflict on token purity, and checks 2-4 report zero colour, class and typography drift.

Can G10 be ticked? **Not as a clean pass.** The audit is complete, the tests exist and are green, and the coverage work in §2.1 is real, but two DoD clauses depend on hub projections (§5 items 1-2), and the row's own dependency `G05` is still `[ ]` at `todo-ui-2.md:34` even though its Dock code and its 10 tests have landed. Recommendation to the owner: tick G10 only with the note "audit + tests delivered; dir boundary closed for projected directions, open for Denpa witness text and reader translation rows pending hub fields", or leave it unticked and track those two contracts as their own rows.

## 5 · Report-only items for the owner

1. **Hub contract — Denpa.** Add `language` and/or `direction` to the public transmission row (`packages/moonql-client/src/generated.ts:2152-2160`, produced by D06), then attribute `src/ui/client/DenpaTransceiver.tsx:198-200`. Until then the deck renders witness text in the document's direction. Do not let a script detector fill the hole.
2. **Hub contract — corpus reader.** Add `direction` beside `languageCode` on `/corpus/reader` translation rows (`src/data/queries/reader.ts:26-33`), matching `TermForm.direction` and `GraphAlias.direction`; then `src/ui/components/reader.tsx:224` can drop its `=== 'ar'` inference.
3. **New-copy task (not G10).** The Reader source-identity table (9 `<dt>`), the terms column set and section headings, the Denpa panel titles and the constellation/`actors.tsx` vocabulary need catalogue keys. `test/unilex-list.test.mjs:44-58` currently asserts English literals for the terms columns, so that contract test must move with the copy.
4. **Dead catalogue keys — 20 remain** with no renderer: `formPatchSearchLabel`, `formPatchSearchPlaceholder`, `formClearSearch`, `formResearchSearchPlaceholder`, `statusStreamLive`, `statusAutoplayBlocked`, `statusStreamStall`, `statusStreamUnavailable`, `statusLoggingPaused`, `statusBeaconSent`, `statusBeaconFailed`, `statusFailoverAmbient`, `playerPlay`, `playerStop`, `emptySourceAttached`, `emptyResearch`, plus the four `actors.tsx` duplicates named in §2. Two of them (`playerPlay`, `playerStop`) are visibly a live defect: `src/ui/client/Player.tsx:268` types out `'STOP' : 'PLAY'` while both locales already exist. Wiring needs an owner decision on the player surface, which is outside this gate's file scope.
5. **Attribution polish.** Drop or correct `lang="en"` on transliteration (`src/ui/components/terms.tsx:62`); add `lang="en"`/`lang="id"` to the registry label pairs `preferredEn`/`preferredId`/`labelEn`/`labelId`, whose language the hub already names in the field; decide whether untranslated hub prose (`registry.notice`, `interpretation.reason`, `export.reason`) needs a `lang` marker on an `/id` page.
6. **Gate bookkeeping.** `todo-ui-2.md:39` lists UI2-G10 as depending on `G01,G05`; the assignment given to this gate named only G01. UI2-G05 is still `[ ]` at `todo-ui-2.md:34` although its Dock work and `test/header-shell-no-clip-contract.test.mjs` (10/10 green) are now in the tree — that row is the owner's to tick, and it gates nothing in this audit's conclusions.
