# Claims register — mockup copy on a-l-l-a-h.com

M45-11. The mockups are design references, not sources of fact. Every statement
reproduced verbatim from them is listed here with the evidence that supports it,
or with the owner's explicit acceptance that it is a non-factual design string.
Nothing may render on the site unless it has a row here.

**Owner authorization:** explicit instruction on 29 October 2026 (Asia/Jakarta) to
reproduce the mockup copy verbatim ("Salin teks mockup apa adanya"). That decision
covers the `accepted` rows below; it does not create evidence for a factual claim.

**Verification run:** `apps/empire-web/scripts/check-fidelity.mjs` measures layout,
not truth. `apps/empire-web/test/contracts.test.mjs` and `export-check.mjs` assert
the presence/absence rules; this file is the human-auditable record they point to.

| # | Claim | Where | Reference | Status | Evidence / decision |
|---|---|---|---|---|---|
| 1 | `4+ STORY WORLDS` | Home hero, library stats | REF-01, REF-02 | **Supported** | `src/lib/story-universe.ts` defines four story records (`manusia-pulpen`, `angelwithshotgun`, `ggs`, `empire-of-the-light`). The `+` is forward-looking; the four are real drafts. |
| 2 | `∞ IDEAS & POSSIBILITIES` | Home hero | REF-01 | **Non-factual** | An infinity glyph, not a measurement. No count is implied. |
| 3 | `1 HUMANITY` | Home hero, library stats | REF-01, REF-02 | **Non-factual** | Rhetorical, not a demographic claim. |
| 4 | `50+ STORIES & IDEAS` | Library stats | REF-02 | **Unsupported metric — owner-accepted** | The catalogue holds **four** story concepts; there is no evidence of fifty. Reproduced verbatim under the owner instruction above. Any reviewer may reject this row and the string must then fall back to the catalogue count. |
| 5 | `EST. 2025` | Footer bottom bar | all | **Owner-accepted** | The repository's first commit and the release history begin in 2025; the exact founding date is not recorded. |
| 6 | `MOONWITNESS XV UNIVERSE` | Footer bottom bar | all | **Supported** | The product name in `BLUEPRINT.md`. |
| 7 | Social icons (YouTube, X, Instagram, Telegram) | Footer of the mockups | all | **Drawn, not linked** | The four marks render as decorative SVGs (`aria-hidden`, no `href`) so the footer matches the mockup without inventing a destination. They become links only when the owner supplies a real URL; `export-check.mjs` also forbids external `a-l-l-a-h.com` links. |
| 8 | `LIVE NOW` badge | GGS lesson card | REF-05 | **Owner-accepted — shipped as story time** | Rendered by `GgsPage` next to the lesson title. The card carries the caption `Story time in this fiction · not a live session`, and `export-check.mjs` now asserts that caption instead of banning the badge outright. |
| 9 | `JOIN TODAY — 10:12 WIB` | GGS lesson CTA | REF-05 | **Owner-accepted — shipped as story time** | The red CTA is a link to `/stories`; no registration, no session. The same caption sits directly under it. `the 10:12 WIB value` is labelled `TIME` in the lesson meta. |
| 10 | `SAVE THE DATE — 12 APR 2025` | GGS sessions card | REF-05 | **Owner-accepted — fictional session date** | The sessions card shows `12 APR 2025 · 20:00 WIB` as the next session of the fictional circle and the block is captioned `FULL MOON SESSIONS`/`LIVE GATHERINGS`; no event exists and no calendar write occurs. |
| 11 | Qur'an 8:60 quotation and key verses | Reader wisdom panel | REF-03 | **Blocked (rights) — shipped as withheld** | Reproducing the mockup's English rendering would publish an unlicensed translation. `ReaderPage` measures the panel from REF-03 and renders `RELIGIOUS SOURCE CONTENT WITHHELD` inside it; only the citation numbers (8:60, 2:190, 4:75, 47:4, 3:104, 9:122) are shown, which cite without quoting. The verse ships only with Uthmani Arabic (`dir="rtl"`), a named translation, its licence, and the verified reference. |
| 12 | `ANGELWITHSHOTGUN`, `ROCKSOUL`, `MYLUFT`, `GGS`, `MANUSIA PULPEN`, `EMPIRE OF THE LIGHT` | All pages | REF-01…05 | **Supported** | Fictional names defined in `src/lib/story-universe.ts`; the site states they are fiction. |

## Standing rules

1. A new verbatim string requires a new row **before** it merges.
2. `Supported` needs a file, command or dataset in this repository; a mockup is not evidence.
3. A `Blocked` row must not render as if resolved. The withheld notice is the fallback, not a placeholder to be filled "later".
4. Rows 4, 5, 8, 9 and 10 are the ones a reviewer is most likely to reject. They exist because the owner asked for verbatim copy, and they are recorded so that decision stays visible.
