# UI2-P17a — Six edition identities, licence assertions and citations for QS 2:82

- **Task:** UI2-P17a (P0 · D1) — Dock · Comparative 1·6·3 Reader (parent M08 / M19-19 / M19-31)
- **Depends:** UI2-G02 (rights gate), UI2-G05 (shell contract)
- **Repo state at audit:** branch `dev`, HEAD `948db67`, working tree preserved
- **Scope:** read-only audit. No source file was modified by this task.
- **Method:** every claim below is either a `file:line` at this HEAD, a `git show` of a named commit, or a command actually run and its literal output.

The leaf warns *do not assume rights-cleared literals are proof*. They are not proof, and this audit shows four separate reasons.

---

## 1. The six edition identities: where they came from and where they are now

The "1 passage · 6 editions · 3 dimensions" set was never a projection of repository data. It was one literal array inside the Dock page, removed at `724fb15`.

`git show 724fb15 -- apps/dock/src/app/reader/compare/page.tsx` (the array is `EDITIONS_QS_2_82`, 6 entries; text payloads deliberately not reproduced here — see §5):

| # | `editionCode` | `name` | `tradition` | asserted `licenseStatus` | exists in data today |
|---|---|---|---|---|---|
| 1 | `quran_cairo_hafs` | Cairo Hafs (1924 Standard) | Uthmanic Hafs an Asim | `RIGHTS_CLEARED` | **yes** — the only `corpus_editions` row |
| 2 | `quran_warsh_madina` | Warsh an Nafi (Madinah 1422) | Maghrebi / North African Witness | `RIGHTS_CLEARED` | no |
| 3 | `id_kemenag_2019` | Indonesian Kemenag (2019 Revised) | Southeast Asian Vernacular | `RIGHTS_CLEARED` | no (as an edition; a Kemenag *translation* exists — §2) |
| 4 | `en_sahih_international` | Sahih International | Modern English Semantic Rendering | `RIGHTS_CLEARED` | no |
| 5 | `ar_corpus_morphology` | Arabic Grammar & Syntax Segment | Syntactic Parsing Representation | `RIGHTS_CLEARED` | no |
| 6 | `comparative_commentary_note` | Editorial Linguistic Note | Reviewer Commentary | `RIGHTS_CLEARED` | no |

Observed command (`948db67`):

```
grep -rn "quran_warsh_madina|en_sahih_international|ar_corpus_morphology|comparative_commentary_note|id_kemenag_2019" apps packages docs scripts
→ no matches outside git history
```

So **5 of the 6 identities exist nowhere in the repository** except in a commit that removed them. They were typed into the page with a rights label already set to cleared. The UI label was the only origin of the grant.

Also note the category error the mockup baked in: entries 3 and 4 are translations, 5 is a morphological analysis, 6 is reviewer commentary. `corpus_editions` is a manuscript/recitation-edition model (`packages/moonql-corpus/src/index.ts:189`). A comparison page that mixes editions, translations and commentary as six parallel "editions" does not match the schema owner.

Current page state at this HEAD — `apps/dock/src/app/reader/compare/page.tsx:1-33` renders `PageHeader` plus `<Alert tone="hot">{copy.errorResearchUnavailable}</Alert>` and no rights literal and no text payload. Pinned by `apps/dock/test/research-public-withholding.test.mjs:18-22`, which asserts the source does **not** contain `EDITIONS_QS_2_82`, `RIGHTS_CLEARED`, `textPayload`, or the quoted strings themselves.

## 2. What QS 2:82 actually has behind it

| Object | Owner | Rights state | Line |
|---|---|---|---|
| Work `quran` ("Al-Qur'an al-Karim", `originalLanguage: 'ar'`) | `corpus_works` | n/a | `packages/moonql-corpus/src/index.ts:176-186` |
| Edition `quran_cairo_hafs`, sourceUri archive.org, provenanceSha pinned | `corpus_editions` | `RIGHTS_EXACT_VERSION_CLEARED` | `:206-216` |
| Passage `QS 2:82` (surah 2 ayah 82, `rgblForeignRef: RGBL-TEXT-002-082-V10`, `verifiedAt: 2026-10-26`) | `corpus_passages` | inherits edition | `:241-252` |
| Translation `QS_2_82_id_kemenag`, `languageCode: 'id'`, translator Kemenag RI | `corpus_translations` | `RIGHTS_EXACT_VERSION_CLEARED` | `:277-292` |

Counts are exact, not approximate: **1 edition, 1 passage row, 1 translation** — so at most **2 readable layers** (Arabic source + Indonesian), not 6, and no English layer at all. A six-pane comparison cannot be built from this data without inventing four panes.

## 3. The three concrete licence defects

### 3.1 The provenance hash is not a digest of the stored text

`corpus_editions.provenanceSha = c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912` (`:214`). Computed against the seeded Arabic string, at this HEAD:

| Encoding of the passage text | SHA-256 |
|---|---|
| literal file bytes | `6d19b50523587fdf85940c208b511b3d7a7a60c15ea2e675f3c2f8b7a3521b5f` |
| Unicode NFC-normalised | `9c7bdf8433b3f14874901ff2060823dcfc8a704767989f93fce031dcf67518df` |
| claimed value | `c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912` |

No repository content hashes to the claimed value. The same literal is re-exported as `QURAN_SHA256` in `packages/moonql-research/src/seed.ts:129`, so the fake is shared by two domains rather than caught by either.

The tests do not close this: `apps/arsy/test/corpus-ingestion.test.ts:31` asserts only `assert.ok(edition.provenanceSha, 'Provenance SHA is pinned')`, and `corpus-reader.test.ts:45`, `corpus-browse.test.ts:276`, `corpus-reader-pg.test.ts:56` assert the **shape** `/^[a-f0-9]{64}$/`. A 64-hex-character shape check passes on any invented 64 hex characters. One test asserts a presentation string contains `provenance=c0a8f1e7` (`corpus-reader.test.ts:60`), which pins the literal's propagation, not its truth.

### 3.2 The cited origin does not resolve

The edition's `sourceUri` is `https://archive.org/details/cairo-quran-1924`. Observed at this session:

```
curl -s -o /dev/null -w "%{http_code}" --max-time 20 https://archive.org/details/cairo-quran-1924
→ 404
```

That is one observation from one network path, not proof the collection item never existed; what it does establish is that the pointer ADR-0003 requires for verification is currently dead, so the clearance is unverifiable from the record itself.

### 3.3 Clearance is a schema default, so it is granted by omission

`corpus_translations.rightsStatus` defaults to `'RIGHTS_EXACT_VERSION_CLEARED'` (`packages/moonql-corpus/src/index.ts:267`), and the field's `licenseName` defaults to `'Open Official Indonesian Translation'` (`:268`). Under M06-06's own table (see §4) a default that publishes bytes is the wrong polarity: a new translation row is cleared the moment it is created, with no reviewer decision. `corpus_editions` defaults the other way (`PUBLIC_DOMAIN`, `:199`) — and M07-04 §1 treats only `RIGHTS_EXACT_VERSION_CLEARED` as publishable, so the default renders every new edition blocked while the model's own label ("Public Domain") reads as permissive. Two defaults, one policy, contradictory outcomes.

## 4. Contradictions with the ratified rights decisions

| Authority | Says | Consequence for P17b |
|---|---|---|
| M06-06 `docs/decisions/M06-06-rights-classification.md:13-21` | `RIGHTS_EXACT_VERSION_CLEARED` means public domain **or explicitly licensed under CC-BY / MIT / Apache 2.0**; `RIGHTS_UNKNOWN` is restricted to METADATA_ONLY | A licence name is not enough: the grant needs a named licence or PD status per edition, not the string "Verified Recitation Transmission" |
| M06-06 `:25` | "No asset with `RIGHTS_UNKNOWN` may be exposed on public endpoints or committed as raw media bytes into the public Git repository" | Rules out committing any of the five absent editions as literals to "make the page work" |
| M07-04 `docs/decisions/M07-04-rights-veto-policy.md:11-16` | only an exact cleared edition serialises bytes; otherwise `[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]` | Implemented and sound in `packages/moonql-corpus/src/index.ts:39-40` |
| M07-04 `:20` | "Verified in `apps/radio/test/corpus-ingestion.test.ts`" | **Stale citation** — `apps/radio` does not exist at this HEAD (`ls apps` → aigateway, arsy, cockpit, dock, echolog, headquarters, lumen-runtime, orbit, sentinel, skylink). The real tests live at `apps/arsy/test/corpus-ingestion.test.ts`. The gate is enforced; the ADR's pointer to its proof is wrong. |
| ADR-0003 `docs/decisions/ADR-0003-source-rights-and-consent.md:31` | requires a `bytesDigest` of the reference edition for integrity | §3.1 shows the digest field exists but holds no digest |
| MASTER_VISION `docs/vision/MASTER_VISION_NARRATIVE_XV.md:817` | lists five Qur'an dataset names (`quran-tanzil-uthmani`, `quranenc-indonesian-kemenag`, `quranenc-english-rwwad`, `quran-arabic-lexicon`, `quran-tafsir-sample`) and states "Arabic source, translations and exegesis require **separate** edition/rights review" | Even the aspirational corpus is 5 named datasets with **none** cleared, and the doc itself forbids treating them as one cleared set |
| M34-02 `docs/decisions/M34-02-moonlab-hq-desk-decision.md:143` (NA-3) and the open NA-4 rights item | comparative/public research projections need D08 re-ratification | D08 has no implementation at all (UI2-G02 finding), so the public exit for comparative text does not exist |

Note also that `RIGHTS_STATUSES` is declared twice with identical members — `packages/moonql-corpus/src/index.ts:31` and `packages/moonql-research/src/seed.ts:120` — two lists that must be kept in step by hand.

## 5. Rights risk carried in git history

`724fb15` (and its parents) contain, in `apps/dock/src/app/reader/compare/page.tsx`, seven full text payloads that were labelled cleared without a grant: the Arabic passage, an Indonesian rendering, an English rendering ("Sahih International"), a transliterated morphological parse, and an editorial note. This is **not** an argument to rewrite history; it is the reason the withheld-state test asserts on the strings themselves (`apps/dock/test/research-public-withholding.test.mjs:20`) so a future edit cannot quietly re-add a payload. This audit deliberately does not reproduce those payloads. Whether any specific modern rendering is redistributable is a D08/legal question and is out of scope for a UI leaf — flagging, not deciding.

## 6. Verdict

**UI2-P17a is COMPLETE as an audit.** Its DoD is "audit all six edition identities, licence assertions and citations … do not assume rights-cleared literals are proof", and the audit produced the identity inventory, the data counts, the three reproducible licence defects, and the authority contradictions.

**UI2-P17b–P17e remain BLOCKED, and P17 cannot ship as designed.** Blocked by facts, not by effort:

1. **No data owner for six editions.** 1 edition + 1 translation exist (§2); the other 5 identities are nowhere in the repo (§1). Six panes would be invented content, which M06-06 `:25` forbids.
2. **No verifiable clearance for the layers that do exist.** Dead origin pointer (§3.2) and a provenance hash that is not a digest of anything (§3.1), against M06-06's definition of "cleared" and ADR-0003's `bytesDigest` requirement.
3. **No D08 public projection for comparative text**, and UI2-G02 is itself NO–BLOCKED for the same reason, plus the live leak through `/orm/research/case` and `/trace` recorded there.
4. **Schema defaults grant clearance silently** (§3.3) — a one-line polarity fix owned by the corpus/data domain, not by a UI leaf; deliberately not changed here.

Honest achievable scope, once (2) and (3) are resolved by their owners: a **two-layer** comparative view (cleared Arabic edition + cleared Indonesian translation) driven by `/corpus/reader` with the existing rights veto, plus an explicit "no edition grant recorded for these five identifiers" panel. That is a different screen from the mockup, and the mockup's `6 EDITIONS / 3 DIMENSIONS` badges must not be rendered as counts until a data owner supplies them.

## 7. Commands actually executed

```
git status --short ; git log --oneline -3                 # branch dev, HEAD fe8e84c -> 948db67
grep -rn "editionCode|edition_code|editions" apps/dock/src packages/moonql-corpus/src apps/arsy/src
sed -n 180,330p packages/moonql-corpus/src/index.ts
grep -rn "RIGHTS_STATUSES\s*=" packages apps
grep -rni "six edition|6 edition|six-edition" docs todo-ui.md todo-ui-2.md
sed -n 805,825p docs/vision/MASTER_VISION_NARRATIVE_XV.md
grep -rni "comparative|perbandingan" MASTER_DESIGN.md docs/planning docs/decisions
git show 724fb15 -- apps/dock/src/app/reader/compare/page.tsx
grep -rn "<the five absent edition codes>" apps packages docs scripts        # no matches
sed -n 1,40p docs/decisions/M07-04-rights-veto-policy.md
sed -n 1,35p docs/decisions/M06-06-rights-classification.md
ls apps ; ls apps/radio                                     # apps/radio: No such file or directory
node -e "…sha256 of seeded arabicText, raw / NFC…"           # §3.1 table
curl -s -o /dev/null -w "%{http_code}" https://archive.org/details/cairo-quran-1924   # 404
grep -rn "provenanceSha|c0a8f1e7" apps packages scripts | grep -i test
```

Not executed: any build, test suite, Playwright run, or file edit for this leaf — the audit is read-only by design, and `pnpm verify` evidence for this HEAD is CI's to report.
