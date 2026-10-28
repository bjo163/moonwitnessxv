# M19-05 · Arabic, Hebrew and Greek scripts, RTL and diacritics

Task: **M19-05 — Test Arabic/Hebrew/Greek scripts, RTL and diacritics** (P1, D3). Authority: `TODO.md:454`, `docs/milestones/M19.md:13` (both read at baseline; neither was edited). Owner: D3 / Dock reader surface.

**Packet fact, stated plainly:** there is **no** `docs/tasks/M19/M19-05.md`. `docs/tasks/M19/` contains packets 02, 03, 04, 09, 13–17, 19, 21–24, 26, 27, 29–32, 34, 35 — `ls docs/tasks/M19/ | grep -c "M19-05"` returns `0` and `test -e docs/tasks/M19/M19-05.md` exits `1`. Scope below is therefore derived from the TODO row plus the milestone file, as instructed.

---

## 0 · Baseline

| Item | Observed |
| --- | --- |
| Branch | `dev` (no branch created, per Owner Policy) |
| `git rev-parse HEAD` at start | `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` — `docs(todo): close M17-04 and M21-07 at their evidence SHAs` |
| `git rev-parse HEAD` at final verification | `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` (unchanged) |
| Working tree | 93 porcelain entries before this gate's audit note: 92 foreign, 1 new (this gate's test). Foreign work preserved untouched, including `apps/dock/src/app/globals.css`, `apps/dock/src/app/patches/page.tsx`, `apps/dock/src/ui/client/PatchesExplorer.tsx`, `apps/dock/test/responsive-accessibility.test.mjs`, `apps/headquarters/src/app/(admin)/page.tsx`, `packages/moonql*`, `apps/arsy/src/config.ts`, `.env.example`, 45 entries under `docs/audit/`, and untracked `apps/arsy/test/witness-access.test.ts`, `apps/dock/src/data/queries/patches.ts`, `apps/headquarters/src/lib/monitor-copy.ts`, etc. |

Commands executed, all from `Z:\project\moonradio`:

```text
$ git rev-parse HEAD            -> 5b70e76cfe81a9d310c17f4a02ca022aa84beb87
$ git branch --show-current     -> dev
$ git status --porcelain        -> foreign changes as above; none authored here
$ test -e docs/tasks/M19/M19-05.md ; echo $?   -> 1
$ ls docs/tasks/M19/ | grep -c "M19-05"        -> 0
```

No git write command was run (no `add`, `commit`, `stage`, `push`, `rebase`, `stash`, `restore`, `clean`, `reset`), no server was started, no browser or screenshot harness was invoked, and no hub/database call was made.

## 1 · Claimed vs actual change

| Claimed by the assignment | Actually present |
| --- | --- |
| one new dependency-free `node:test` file in `apps/dock/test/` | `apps/dock/test/m19-05-script-rtl-diacritics.test.mjs` (new, untracked) |
| one new audit note under `docs/audit/` | `docs/audit/M19-05-script-rtl-diacritics-5b70e76.md` (this file, new, untracked) |
| no app source edits | zero tracked files modified by this gate; `git status --porcelain` shows exactly these two new `??` entries as this gate's output |

The test imports only `node:assert/strict`, `node:fs`, `node:path`, `node:url` and `node:test` — no workspace package, no TypeScript import, so it runs under the declared runner without `--experimental-strip-types` needing any local `.ts` resolution.

## 2 · The contract as found (read-only inspection)

| Source | Line | Contract |
| --- | --- | --- |
| `apps/dock/src/ui/components/reader.tsx` | 186 | `<p className="dk-reader-arabic" lang={result.arabic.language} dir={result.arabic.direction}>` |
| `apps/dock/src/ui/components/reader.tsx` | 190 | `{result.arabic.script} script · {result.arabic.direction.toUpperCase()} · exact edition bytes` — the direction is also stated in words, not only painted |
| `apps/dock/src/ui/components/reader.tsx` | 224 | `<p lang={row.languageCode} dir={row.direction ?? 'auto'}>` |
| `apps/dock/src/data/queries/reader.ts` | 40 | `ReaderArabic.direction: 'rtl'` — a single literal, no path to `'ltr'` and no optional form |
| `apps/dock/src/data/queries/reader.ts` | 28 | `ReaderTranslation.direction: 'ltr' \| 'rtl' \| null` — a legacy row may declare nothing |

Two corroborating facts, read but **not executed here**: `apps/arsy/test/corpus-reader.test.ts:65-98` creates a synthetic Hebrew row with no `direction` and asserts the projection returns `direction: null` ("missing authoritative direction stays unknown rather than being guessed"), then sets `rtl` and asserts `rtl.text` equals the diacritic-bearing fixture unchanged. That is the hub half of the same contract; the Dock half is what this gate pins.

A repository detail that affects any source-contract test: both reader files are checked out with **CRLF** line endings in this working tree. The new test normalises `\r\n` to `\n` at read time and says so in a comment; matching raw bytes would make the interface assertions platform-dependent.

## 3 · What `test/m19-05-script-rtl-diacritics.test.mjs` pins

Ten clauses, in the style of `reader-static-structure.test.mjs` and `locale-routes.test.mjs` (static assertions over real files, no rendering):

1. Arabic paragraph reads `lang`/`dir` from `result.arabic.*`; `ReaderArabic.direction` is exactly `'rtl'`; the direction is also printed as text.
2. Translation rows read `lang={row.languageCode}` / `dir={row.direction ?? 'auto'}`; the projection type allows `null`; no element in the view pins a literal `dir="ltr"`/`dir="rtl"`; no fallback uses `?? 'ltr'` or `|| 'ltr'`; no projection declares a sole `direction: 'ltr'`.
3. `/reader` text is a JSX child expression (`{result.arabic.text}`, `{row.text}`), never `dangerouslySetInnerHTML`; neither file calls `.normalize(`, matches `\p{M}` or `\p{Mn}`; neither contains a bidi control character.
4. Synthetic Arabic and Hebrew samples (three base letters each, built from code points) survive a JSON transport round-trip with identical code points and an unchanged number of combining marks.
5. The synthetic Greek sample survives the same round-trip; NFC composition of alpha + psili + acute reverses under NFD with no mark lost — the test asserts canonical equivalence, not byte identity, because Greek movement under NFC is not diacritic loss.
6. No sample needs an HTML entity (`&name;`, `&#n;`, `&#xn;`) or a bidi control in U+202A–U+202E / U+2066–U+2069 to display; none contains `&` at all.
7. A row with `direction: null`, `undefined` or absent yields `'auto'`; `'rtl'` and `'ltr'` rows are passed through; the `null` result is explicitly `notEqual` to `'ltr'`.

Clauses 8–10 are the negative fixtures required by the assignment. Each mutates the **real** source and asserts the same predicate now returns `false`, and each first asserts the mutation actually applied (`assert.notEqual(mutated, original)`), so a rename upstream makes the negative test fail loudly instead of passing vacuously.

## 4 · Commands and observed output

All from `Z:\project\moonradio\apps\dock`, using the runner declared in `apps/dock/package.json` (`node --experimental-strip-types --test test/*.test.mjs`).

1. New gate file:

```text
$ node --experimental-strip-types --test test/m19-05-script-rtl-diacritics.test.mjs
✔ M19-05: the Arabic source paragraph takes language and direction from the projection (0.9112ms)
✔ M19-05: translation rows declare their own language and fall back to auto, never ltr (0.2412ms)
✔ M19-05: reader text reaches the DOM verbatim — no markup and no normalisation step (0.2086ms)
✔ M19-05: Arabic and Hebrew samples keep every combining mark through a transport round-trip (0.7392ms)
✔ M19-05: Greek marks survive, and canonical equivalence is preserved without rewriting (0.2538ms)
✔ M19-05: the samples need no HTML entity and no bidi control character to display (0.258ms)
✔ M19-05: a row with direction null falls back to auto, never to a hardcoded ltr (0.184ms)
✔ M19-05 negative: a hardcoded dir="ltr" on the Arabic paragraph fails the contract (0.1153ms)
✔ M19-05 negative: a direction default of ltr fails the contract (0.1738ms)
✔ M19-05 negative: a normalisation step that removes combining marks fails the contract (0.281ms)
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

2. Adjacent existing reader tests (regression), same runner:

```text
$ node --experimental-strip-types --test test/reader-static-structure.test.mjs test/reader-rights.test.mjs
✔ UI-P05b: … (13 clauses, all pass)
…
ℹ tests 18
ℹ pass 18
ℹ fail 0
```

3. Lint of the new file, repo-root ESLint config:

```text
$ pnpm exec eslint apps/dock/test/m19-05-script-rtl-diacritics.test.mjs
(no output)   exit 0
```

4. Interim state, reported for honesty: the first run of the new file was **9 pass / 1 fail**. The failure was in this gate's own clause 2 — the assertion `doesNotMatch(querySource, /direction\??: 'ltr'/)` matched the legitimate union at `reader.ts:28` (`direction: 'ltr' | 'rtl' | null`), not a default. The check was narrowed to a **sole** `'ltr'` type (`/direction\??: 'ltr'(?!\s*\|)/`) plus explicit `?? 'ltr'` / `|| 'ltr'` view checks; the final run above is 10/10. No source file was involved in the failure.

## 5 · Negative evidence, itemised

| Forbidden shape | Mutation applied | Predicate result | Clause |
| --- | --- | --- | --- |
| hardcoded `dir="ltr"` on the Arabic paragraph | `dir={result.arabic.direction}` → `dir="ltr"` | `arabicAttributes` → `false` | 8 |
| `direction` default of `'ltr'` | `dir={row.direction ?? 'auto'}` → `?? 'ltr'` | `translationAttributes` → `false` | 9 |
| `direction` default of `'ltr'` | `direction: 'rtl'` → `direction: 'ltr'` and → `'ltr' \| 'rtl'` | `arabicDirectionIsRtl` → `false` in both | 9 |
| normalisation removing combining marks | `{result.arabic.text}` → `{result.arabic.text.normalize('NFD').replace(/\p{M}/gu, '')}` | `textIsRenderedVerbatim` → `false`, `textIsNotNormalised` → `false` | 10 |

The fixture half is symmetric: `stripMarks(sample)` (NFD then drop `\p{M}`) changes every sample and leaves zero marks, so the samples really can detect a mark-stripping step rather than merely coexisting with one.

## 6 · Limitations — what this evidence does not prove

- **Static and synthetic only.** The test reads source text and round-trips code points. It does not render React, does not run the browser bidi algorithm, and cannot show that `dir="auto"` picks the right paragraph direction for a given row; that behaviour is the user agent's and is unverified here.
- **No screenshot, no visual evidence, no browser run.** Nothing was written under `docs/audit/screens/`, and `M19-06` (visual/behavioural baseline) remains the task that would supply it.
- **No real scripture or private witness text.** Samples are three synthetic base letters per script with combining marks built from code points; no verse, translation or witness material appears in the test, the audit or any output.
- **CSS is not asserted.** `apps/dock/src/app/globals.css` is dirty from a parallel session and out of scope; read-only observation: `.dk-reader-arabic` (around line 888) sets `text-align: right` for the Arabic block, which is consistent with an RTL source but is not pinned by this gate.
- **Hub integration not executed.** `apps/arsy/test/corpus-reader.test.ts:65-98` was read, not run; it is cited as adjacency, not as evidence produced here.
- **Line-ending dependency.** The test normalises CRLF before matching; a file re-written with mixed endings inside a JSX expression would still be read but could defeat an exact-line regex, which is why the predicates match whole attributes rather than whole lines.
- **One negative shape is unpinned by source alone:** the test asserts the *declared* fallback expression and the projection type. It cannot prove no other component re-derives direction from a language code; that broader rule lives in `locale-boundary-coverage.test.mjs` and was not re-run here.

## 7 · Rollback

Delete the two files this gate created; there is no other state:

```text
apps/dock/test/m19-05-script-rtl-diacritics.test.mjs
docs/audit/M19-05-script-rtl-diacritics-5b70e76.md
```

No tracked file was modified, so no `git checkout`/`restore` is required, and no migration, config or generated artefact is involved.

## 8 · Result

`result_sha`: **left to the integrator** — this note is committed by the integrator together with the new test, so the result SHA is the commit that carries both. Evidence quoted above is against baseline `5b70e76cfe81a9d310c17f4a02ca022aa84beb87` plus these two untracked files, and HEAD was re-checked at that same SHA at final verification.
