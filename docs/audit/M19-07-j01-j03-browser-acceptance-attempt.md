# M19-07 — J01/J03 browser acceptance attempt (NOT MET)

> **Superseded:** the Dock layout and skip-link defects recorded here were fixed, and the rerun at [M19-07-j01-j03-browser-acceptance.md](M19-07-j01-j03-browser-acceptance.md) passes 29/29 clauses. This file stays as the NOT MET history.

**Task:** M19-07 — "Run J01/J03 browser acceptance; J05 only when Story is in release scope".
**Acceptance:** "Selected-scope flows pass with accessibility; optional Story cannot block Reader".
**Result: NOT MET.** This record documents a real browser run, what it proved, and why the leaf stays open. No checkbox change and no accessibility certification is claimed.
**Baseline:** `b3479e6991831b759d842fbe753fe8c30d233792` (`dev`, observed at the start of the run). No packet exists at `docs/tasks/M19/M19-07.md`.

## Scope source

[MASTER_VISION_NARRATIVE_XV.md:1067](../../vision/MASTER_VISION_NARRATIVE_XV.md) defines **J01 Verse search** (QS 2:82; exact source/edition + rights + meaning + citation; honest fallback `UNKNOWN`, no fake ayah), :1069 defines **J03 Divine-name comparison** (Elohim / YHWH / ALLAH; original languages, senses, usage, tradition labels, relation evidence; no forced `sameAs`) and :1071 defines **J05 Creative archive** (THE BATTERIES episode; metadata-only, no fabricated books). There is no packet file for M19-07, so this attempt scopes from the TODO row plus those three journey definitions.

## What was attempted

A self-contained Playwright acceptance test was written at `apps/dock/test/m19-07-j01-j03-browser-acceptance.test.mjs` (550 lines, since deleted). It spawned the repository's own ephemeral fixture (`scripts/ui/ephemeral-hub.mjs` with the seeded in-memory engine) plus the Dock dev server on a free loopback port, then loaded `/{en,id}/reader` in Chromium at 1440×900, asserted shell structure, the prefilled `QS 2:82` search form, the Arabic source block, the cleared translation, the citation title, the J03 navigation path and the absence of any Story dependency, and ran a separate skip-link keyboard clause.

Command (working directory `apps/dock`), exit code **1**:

```
pnpm --filter @moonwitness/dock exec node --test test/m19-07-j01-j03-browser-acceptance.test.mjs
```

## Observed results

| Observation | Result |
|---|---|
| `/{locale}/reader` returns 200 and renders one `main.dk-main[data-experience="reader"]`, one `header.dk-header`, one `nav.dk-nav`, one `footer.dk-footer`, one `h1` with `html[lang]` matching the locale | **PASS** |
| J01 search entry: `main form[role="search"]` visible, `method=get`, `action=/{locale}/reader`, `#citation` prefilled with `QS 2:82`, localized submit button present | **PASS** |
| J01 source text visible | **FAIL** — `p.dk-reader-arabic` was present exactly once in the DOM with the seeded rights-cleared text, but Playwright resolved it as **hidden** for the full 90s timeout (181 polls), for both `en` and `id`. The J03 test failed on the same locator. |
| J03 navigation path renders and does not block the Reader | **FAIL (not proven)** — the subtest aborts on the same hidden-locator wait; the comparison body is withheld as expected, but "cannot block the Reader" cannot be asserted while the reader source block itself is not visible. |
| J05 / Story | **NOT RUN** — Story is not in release scope, consistent with the TODO row. No public story route was claimed or exercised. |
| Skip link / first keyboard stop | **FAIL (UNMET, recorded as `todo` in the run)** — the first focus stop was the header link `{"tag":"a","href":"/en","text":"MOONWITNESS"}`, not a skip link. The Dock renders no skip link (`docs/design/M19-03-public-ia.md:94`, `:189`), and `<main class="dk-main">` has no `id`/`tabIndex` (`apps/dock/src/layouts/site.tsx:53`). |

Verbatim failure excerpt from the run:

```
✖ id: J03 navigation and comparison withholding cannot block the Reader (90804.2388ms)
  locator.waitFor: Timeout 90000ms exceeded.
  Call log:
    - waiting for locator('p.dk-reader-arabic') to be visible
      181 × locator resolved to hidden <p lang="ar" dir="rtl" class="dk-reader-arabic">…
⚠ skip link is the first keyboard focus stop and targets main content (327.47ms)
  AssertionError: first focus stop was {"tag":"a","href":"/en","text":"MOONWITNESS"}
```

## What this proves and what it does not

- The acceptance test infrastructure works: the ephemeral Hub, the Dock dev server, Chromium and the locale routing all run, and the reader page renders its shell, its prefilled search and the seeded rights-cleared Arabic text in the DOM.
- It does **not** prove J01: the source block is present but not visible to the browser, so a member cannot read it in this fixture state. A follow-up diagnostic (below) measured the cause as a CSS layout collapse, not a hydration or disclosure problem.
- It does **not** prove J03 or accessibility: the reader visibility failure blocks the J03 clause, and the skip link is absent, so "flows pass with accessibility" is unmet on its face, independently of the reader issue.
- No deployment, real Hub, production data or real witness material was involved. The run used loopback ports only; both processes were stopped with the test process.

## Follow-up needed

**Measured root cause (same day, separate diagnostic).** The ephemeral Hub (`127.0.0.1:3102`, in-memory, seeded) and the Dock dev server (`127.0.0.1:3101`, `RADIO_API_URL` pointing at it) were started again, and a direct Chromium evaluation of `/en/reader` at 1440×900 measured the element chain. The paragraph is rendered, `display:block`, `visibility:visible`, opacity 1 — but its **width is 0 px**:

```text
P.dk-reader-arabic      box=0x3984        (visible, zero width)
SECTION.dk-reader-block box=0x4212
ARTICLE.dk-reader-passage box=42x8773
DIV.dk-reader-grid      box=286x8773
DIV.dk-reader-main      box=286x9187
DIV.dk-reader-layout    box=872x9187
MAIN.dk-main            box=936x9342
```

`.dk-reader-layout` is a three-column grid (`minmax(0, 1.7fr) minmax(210px, 250px) minmax(220px, 300px)`, `apps/dock/src/app/globals.css:1125`), which leaves the main column 286 px inside the 872 px page container at 1440 px. Inside that, `.dk-reader-grid` (`:946`) declares `minmax(0, 1.7fr) minmax(280px, 1fr)`; the 280 px rail minimum consumes the whole track, so the passage column collapses to `minmax(0, …)` = 0 px and the article keeps only its 36 px padding and 6 px border. Playwright therefore reports the Arabic block as hidden even though the markup, text and styles are correct. Two smaller defects share the same origin: the `skip link` is absent and `<main class="dk-main">` has no `id`/`tabIndex` (`apps/dock/src/layouts/site.tsx:53`), so the first focus stop is the header link.

Follow-up, in order:

1. **Dock layout owner:** fix the nested grid so the passage never collapses at desktop width — give the main/layout columns a usable minimum (for example `min-width: 0` plus a rail minimum that cannot exceed its track) at `apps/dock/src/app/globals.css:946` and `:1125`. This is a user-visible reader defect, independent of M19-07.
2. **Accessibility owner (M19-04 / M19-03 line of work):** add the skip link and a `main` target so the first focus stop is the skip link; that clause is a prerequisite for M19-07's accessibility acceptance.
3. Then re-run a J01/J03 acceptance with the same ephemeral fixture and record real output here or in a successor audit.

Both servers were stopped after the diagnostic and the generated `apps/dock/next-env.d.ts` churn was reverted; no repository file was changed by the diagnostic.

## Rights, privacy and limits

- Only the seeded, rights-cleared QS 2:82 sample already used by the repository's own tests was rendered; no additional scripture text, translation or private material was accessed or reproduced in this audit (the Arabic excerpt above is the browser log's own truncation).
- No screenshot was retained; no accessibility certification, browser-support matrix or deployment evidence is claimed.
- The attempted test file was deleted because it fails; it is not part of the repository and nothing references it.
