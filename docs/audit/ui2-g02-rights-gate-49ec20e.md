# UI2-G02 — source rights gate, QS 2:82 grants, D08 denial

Read-only security/rights audit. No file was changed except this document.

## §0 Baseline

- Branch `dev`; HEAD `49ec20ec2b224bcb37c61d15de84aa494cead79e` (`git rev-parse`).
- Working tree carries other sessions' uncommitted work: `apps/arsy/src/app.ts`, `apps/arsy/src/fastify.d.ts`,
  `apps/arsy/src/modules/channels/index.ts`, `apps/orbit/src/lib/projections/*`,
  `apps/orbit/src/lib/server/arsy-runtime-client.ts`, `apps/skylink/src/modules/routes.ts`,
  `docs/audit/screens/*`, `docs/audit/M38-12-*.md`. Touched nothing there.

Commands actually executed:

- `git rev-parse --abbrev-ref HEAD`, `git rev-parse HEAD`, `git status --porcelain`.
- `git log --oneline -- apps/dock/src/app/reader/compare/page.tsx` → `724fb15`, `dc82e79`, `df20640`.
- `git show --stat 724fb15 -- apps/dock/src/app/reader/compare/page.tsx` → `23 insertions(+), 155 deletions(-)`.
- `git show dc82e79:apps/dock/src/app/reader/compare/page.tsx` (grep for rights literals).
- `git merge-base --is-ancestor 724fb15 HEAD` → true; `… dc82e79 HEAD` → true (both ancestors of `49ec20e`).
- Grep: `RIGHTS_CLEARED|RIGHTS_EXACT_VERSION_CLEARED|RIGHTS_UNKNOWN|METADATA_ONLY`, `D08`,
  `release_manifests|rights_approvals|editorial_signoffs|takedown_logs`, `@moonwitness/governance`,
  `createPassageCitation|rightsCleared`, `QS 2:82`.
- `node --test test/reader-rights.test.mjs test/research-public-withholding.test.mjs` (in `apps/dock`)
  → **8 pass, 0 fail**.
- `pnpm exec tsx --test --test-concurrency=1 test/public-projection-denial.test.ts` (in `apps/arsy`)
  → **14 pass, 1 skipped, 0 fail**.
- `pnpm exec tsx --test --test-concurrency=1 test/corpus-reader.test.ts test/corpus-browse.test.ts test/corpus-ingestion.test.ts`
  → **14 pass, 0 fail**.

Not executed, and why:

- No `next dev`, no Dock suite that boots a dev server, no Playwright/`scripts/ui/*` harness — operator holds port 3001
  and that suite fails environmentally.
- No `pnpm verify`, no full `pnpm lint`, no CI run, no Docker, no deploy. No `git add/commit/push/stash/checkout/restore/clean`.
- The two ARSY runs execute against the *dirty* worktree. Their imports (`../src/plugins/envelope.js`, MoonQL addons)
  are not in the modified ARSY paths, but exact-SHA claims for those runs belong to a clean checkout.
- Fact vs inference is marked below. Everything cited was opened and read.

## §1 The rights gate as built (D01 hub side)

The gate is a **status equality check inside one public endpoint**, not an approval system.

- Clearance vocabulary: `packages/moonql-corpus/src/index.ts:31-37` (`RIGHTS_STATUSES`), single accepted value
  `packages/moonql-corpus/src/index.ts:40` (`const CLEARED = 'RIGHTS_EXACT_VERSION_CLEARED'`).
- Edition veto read straight off the row: `packages/moonql-corpus/src/index.ts:101` — comment at `:100` states the
  invariant "a label like PUBLIC_DOMAIN is not clearance".
- Passage/translation serialization: `packages/moonql-corpus/src/index.ts:378` (`editionCleared`),
  `:384` (a translation is cleared only when `editionCleared && row.rightsStatus === CLEARED`),
  `:390` (`text: cleared ? … : null`), `:413` (`state: 'available' | 'rights_blocked'`),
  `:416-419` (Arabic emitted only when cleared), `:423` (`blockedPlaceholder` = `[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]`, `:41`).
- Missing/blank status falls closed to `RIGHTS_UNKNOWN`: `packages/moonql-corpus/src/index.ts:57,389,526,557`.
- The tables holding bytes are admin-only: `corpus_passages` `packages/moonql-corpus/src/index.ts:226` (`ADMIN_FULL`,
  rationale comment `:224-225`), `corpus_translations` `:259` (`ADMIN_FULL`). The one internal view
  `corpusPassageOverview` is `ADMIN_ONLY`: `packages/moonql-corpus/src/index.ts:297-299`.
- `/corpus/reader` is the only `requires: 'public'` text exit: `packages/moonql-corpus/src/index.ts:316-320`.
  Input hardening: blank → 400 `:325-328`; >60 chars → 400 `:329-332`; fuzzy address lookup `:336-343` still runs the
  same veto (`:378`).
- `/corpus/browse` is metadata-only by contract: `packages/moonql-corpus/src/index.ts:513` (`textAvailable`),
  `:531` (`cleared`), `:552-559` (translation rows collapse to language/rights, never wording).
- Policy authority: `docs/decisions/M07-04-rights-veto-policy.md:14-15` (non-cleared → bytes vetoed, placeholder
  `[TEXT_BLOCKED_PENDING_RIGHTS_CLEARANCE]`, safe metadata only).

Dock side (`apps/dock`) — the Dock does **not** re-derive clearance from an authority record; it trusts the projection's
`state` and `rightsStatus`, plus a defensive second guard:

- `apps/dock/src/data/queries/reader.ts:56-63` calls `/corpus/reader`; state union `:42`; comment `:44`
  "every text field is already rights-filtered".
- `apps/dock/src/ui/components/reader.tsx:136` `cleared = source?.rightsStatus === 'RIGHTS_EXACT_VERSION_CLEARED'`;
  `:140` `withheld = result.state === 'rights_blocked'`; `:158-160` explicit denial alert;
  `:178` `!withheld && result.arabic` gate; `:217` `row.text && !withheld` gate;
  `:188-191` and `:222-224` placeholder + reason. Comment `:138-139` states the intent: a rights-blocked result must
  never render text "even if an upstream projection accidentally returns it".
- Badge `RIGHTS CLEARED` at `apps/dock/src/ui/components/reader.tsx:153-154` is emitted **only** when the projection
  already said `RIGHTS_EXACT_VERSION_CLEARED` — so it is a derived label, not a hardcoded claim. (Fact: the condition
  is on `:136`.)
- `/reader` never guesses: `apps/dock/src/app/reader/page.tsx:47-60,107-118`.

Gate boundary (fact): the gate asserts "the D01 edition row says cleared". It does **not** assert that any human,
reviewer or governance domain approved the publication. There is no approval input to the gate (§4).

## §2 `/reader/compare` audit — hardcoding finding

**Refuted at HEAD `49ec20e`; confirmed historically.**

- Current file is 33 lines and contains no rights value, no edition list, no citation minting, no text:
  `apps/dock/src/app/reader/compare/page.tsx:1-33`. It imports only MoonUI `Alert`/`PageHeader` (`:2`),
  locale context (`:4-5`) and the states catalogue (`:5`). Its entire content surface is
  `apps/dock/src/app/reader/compare/page.tsx:30` → `<Alert tone="hot">{copy.errorResearchUnavailable}</Alert>`,
  i.e. `apps/dock/src/lib/states-copy.ts:96` (en) / `:237` (id): "The research ledger is withheld until an approved
  D08 public projection is available."
- What a reader can see on `/reader/compare` today: title, subtitle (`:22-23`), breadcrumbs (`:24-28`) and that one
  localized withholding alert. No passage, no edition identity, no rights status, no citation.
- The old defect did exist. At ancestor `dc82e79` the same path held `const EDITIONS_QS_2_82: ParallelEdition[]`
  (`:15`) with `licenseStatus: 'RIGHTS_CLEARED'` hardcoded at `:23,32,41,50,59,68`, called `createPassageCitation`
  with `textPayload: e.text` (`:79`) and `rightsCleared: e.licenseStatus === 'RIGHTS_CLEARED'` (`:80`), and rendered
  `actions={<Badge tone="ok">RIGHTS CLEARED</Badge>}` (`:95`). Consequence then: six "editions" of QS 2:82 with text
  and a green clearance badge, none backed by a D01 edition row or any approval — a self-asserted clearance.
- Removed by `724fb15` (`+23/−155`), which is an ancestor of HEAD. Regression guard:
  `apps/dock/test/research-public-withholding.test.mjs:18-22` asserts the source does **not** match
  `/EDITIONS_QS_2_82|createPassageCitation|RIGHTS_CLEARED|textPayload/`, contains no verse wording, and does render the
  D08 notice. Run here: passes.
- Residual risks (fact + inference):
  - Fact: the guard is a **source-regex** test, and the M19-19 report already records the reviewer caveat that "source
    pattern tests can be evaded by a different form of hardcoded text" (`docs/audit/M19-19-research-public-withholding.md:37`).
  - Fact: `apps/dock/src/app/reader/page.tsx:81-83` still advertises the dead route with a primary CTA
    "1·6·3 COMPARATIVE WORKBENCH →".
  - Fact: compare breadcrumbs use un-localized `href: '/'` and `'/reader'` (`apps/dock/src/app/reader/compare/page.tsx:25-26`),
    while `/reader` uses `localeHref` (`apps/dock/src/app/reader/page.tsx:77,81`). Inference: an `id` visitor is dropped
    out of the locale contract — an i18n defect (G10 scope), not a rights defect.
  - Lint guard against reintroduction exists but is thin: `packages/eslint-config/src/plugin.js:75-86` only requires an
    arity ≥ 2 on `createPassageCitation`; it does not check the rights value.

## §3 QS 2:82 edition grants (only what is pointed at)

Grants that exist in code/seed:

| Address | Record | Rights value | Citation |
|---|---|---|---|
| QS 2:82 (Arabic) | edition `quran_cairo_hafs` | `RIGHTS_EXACT_VERSION_CLEARED`, `provenanceSha c0a8f1e72b4d…` | `packages/moonql-corpus/src/index.ts:208-216` (rights `:212`, sha `:215`) |
| QS 2:82 (id) | translation `QS_2_82_id_kemenag` | `RIGHTS_EXACT_VERSION_CLEARED`, `licenseName 'Public Domain / Open Translation'` | `packages/moonql-corpus/src/index.ts:280-289` (rights `:287`) |
| QS 2:82 | passage row (surah 2 / ayah 82, edition `quran_cairo_hafs`) | — | `packages/moonql-corpus/src/index.ts:242-251` |
| research case | `RC-QS-002-082-AR` | `rightsSnapshot = CLEARED_RIGHTS` | `packages/moonql-research/src/seed.ts:250-260` (`:257`); `CLEARED_RIGHTS` `:127` |
| research case | `RC-QS-002-082-ID` (`sourceSense LICENSED_TRANSLATION`) | `rightsSnapshot = CLEARED_RIGHTS` | `packages/moonql-research/src/seed.ts:261-272` (`:269`) |
| contrast case | `RC-QS-037-030-AR`, edition `quran-tanzil-uthmani` | `rightsSnapshot: 'RIGHTS_UNKNOWN'`, `evidenceSha: null` | `packages/moonql-research/src/seed.ts:273-284` (`:277`, `:281`) |

Observed counts (fact): the corpus seed defines **exactly one edition and one translation** for QS 2:82. Grep of `2:82`
across `packages/` and `apps/` (excluding `node_modules`, `dist`, tests) returns hits only in
`packages/moonql-corpus/src/index.ts` and `packages/moonql-research/src/seed.ts` (+ generated `dist/*.d.ts`).
Inference: the "six editions / three dimensions" comparative premise in the mockup has **no data owner**; `quran-tanzil-uthmani`
is referenced only at `seed.ts:277` and is not seeded, so that case cannot resolve an edition.

Documented, unresolved grant conflicts (facts about documents, not about clearance):

- `docs/audit/M06-01-source-repo-pins.md:16` pins the QS 2:82 corpus source as **`METADATA_ONLY / CC-BY-SA`**,
  contradicting the seed's `RIGHTS_EXACT_VERSION_CLEARED`.
- `docs/audit/M07-01-editions-licenses-inventory.md:16-17` records both rows as cleared ("Public Domain",
  "Official Open License"), with `:25` warning that folder existence in a legacy repo is not clearance.
- `docs/decisions/M34-02-moonlab-hq-desk-decision.md:144` (open item **NA-4**) records the corpus-seed label vs the
  research-seed "licensed translation" wording and states plainly: "Neither is a D08 rights record."
  The research-side wording is at `packages/moonql-research/src/seed.ts:263,384,475`.
- MIZAN re-checks rights at scoring time: `packages/moonql-research/src/gates.ts:345-355` (edition must equal
  `CLEARED_RIGHTS`, `RIGHTS_UNRESOLVED`/`RIGHTS_BLOCKED`), `:356-358` (case snapshot must agree with the edition row),
  `:383-391` (translation rights). This gates a **verdict**, not byte exposure.

Bottom line: the QS 2:82 clearance is asserted by repo-local seed data plus an inventory document. No independent,
non-repo license artifact or approval record was found, and NA-4 is still open.

## §4 D08 implementation status — none

- `ls packages/` (executed): `cli, core, denpa, echolog-core, eslint-config, lumen, moonql, moonql-base, moonql-auth,
  moonql-client, moonql-corpus, moonql-graph, moonql-journey, moonql-actors, moonql-apikeys, moonql-monitor,
  moonql-ontology, moonql-ops, moonql-playlog, moonql-research, moonql-schedule, moonql-settings, moonql-stations,
  moonql-unilex, moonui, skylink-core, skylink-store, skylink-telegram, skylink-whatsapp, testing, types, web-config`.
  **No governance package.**
- Grep `@moonwitness/governance` across json/ts/tsx/md (excluding node_modules): exactly three hits —
  `docs/decisions/M02-02-domain-assignments.md:27` (`D08 | Publication & Governance | @moonwitness/governance
  *(Planned G3)* | release_manifests, rights_approvals, editorial_signoffs, takedown_logs`) and the two negative
  assertions in `apps/arsy/test/public-projection-denial.test.ts:207,1253`.
- Grep the four D08 table names: they appear only in the same doc line `docs/decisions/M02-02-domain-assignments.md:27`
  and in `apps/arsy/test/public-projection-denial.test.ts:203,208,1254` as **must-not-exist** assertions, plus audit docs.
  Zero occurrences in any model definition, migration, or addon.
- Runtime proof, executed: `public-projection-denial.test.ts:195-229` asserts the live registry contains none of the
  four models, that no `governance` addon is installed, that `moonql.model('release_manifests')` throws
  `/unknown model/`, and that `/orm/corpus/reader` response bodies carry no
  `publicationAvailable`/`releaseManifest`/`rightsApproval`/`editorialSignoff`/`takedown` key. Result: **passes**.
- Domain inventory agrees: `docs/audit/M34-01-inventory-d05-mizan-research-exposure.md:41` (C16 "D08 released-research
  projection — Absent (the gap)"); `docs/audit/ui-reader-rail-ab44093.md:81` ("**D08 does not exist.**");
  `docs/audit/M20-02-review-queue-evidence.md:24` (M18-01 state machine specified, "D08 enforcement still
  unimplemented"); `docs/audit/M19-19-research-public-withholding.md:14,27` ("M19-19 must remain unchecked").
- The "D08 packet" in G02's file scope exists only as an unexecuted task sheet: `docs/tasks/M34/M34-04.md:1`
  ("**EXECUTABLE LEAF, NOT VERIFIED**"), TODO row `TODO.md:743` unchecked; `M34-05` also open (`TODO.md:744`).
- `TODO.md:468` — M19-19 open, "Remains open until M34-04 defines the approved projection and positive/negative
  publication tests pass on an exact SHA". `TODO.md:621` — M27-08 **BLOCKED by M19-19**.

**Statement: D08 has no implementation in code at `49ec20e`.** The only publishing gate that exists is the D01 rights
invariant; the reader "publishes cleared text on the rights invariant alone"
(`apps/arsy/test/public-projection-denial.test.ts:210-211`, `docs/audit/ui-reader-rail-ab44093.md:81`).

## §5 Rights ledger

Projection vocabulary source of truth: `packages/moonql-corpus/src/index.ts:31-37` and
`packages/moonql-client/src/generated.ts:523,591,1645`
(`RIGHTS_EXACT_VERSION_CLEARED | RIGHTS_UNKNOWN | METADATA_ONLY | RESTRICTED | PUBLIC_DOMAIN`).
Dock naming: `apps/dock/src/lib/provenance-copy.ts:296-302` (`RIGHTS_KEYS`), `:305-311` (`REVIEW_KEYS`),
`rightsLabel` `:318-321` (unknown code returned verbatim, `:313-317`), `reviewLabel` `:327-330`.

| Code | Where enforced (blocks bytes / blocks a claim) | Where only labeled | Notes |
|---|---|---|---|
| `RIGHTS_EXACT_VERSION_CLEARED` | `packages/moonql-corpus/src/index.ts:40,101,378,384,413,416-419,423`; `packages/moonql-research/src/gates.ts:345-355,383-391`; Dock defensive guard `apps/dock/src/ui/components/reader.tsx:136,140,178,217` | `apps/dock/src/lib/provenance-copy.ts:297`; badge `apps/dock/src/ui/components/reader.tsx:153-154` | The single clearance value. Nothing checks that a *person* approved it (§4). |
| `RIGHTS_UNKNOWN` | Same sites, as "≠ CLEARED"; also the fail-closed fallback for a blank row: `index.ts:57,389,526,557`; `gates.ts:345` default | `provenance-copy.ts:298`; `reader.tsx:154,168` `?? 'RIGHTS_UNKNOWN'` | `docs/decisions/M06-06-rights-classification.md:17,24` — unknown may not appear on public endpoints. |
| `METADATA_ONLY` | Same sites, as "≠ CLEARED" | `provenance-copy.ts:299` | `gates.ts:347` maps it to stage S1 `UNKNOWN` (unresolved), not FAIL. |
| `RESTRICTED` | Same sites, as "≠ CLEARED" only | `provenance-copy.ts:300`; `generated.ts:523` | No code branch treats RESTRICTED specially (fact: grep of the word in `moonql-corpus` shows only the enum member). Distinct from `docs/vision/MASTER_VISION_NARRATIVE_XV.md:602` visibility axis. |
| `PUBLIC_DOMAIN` | Enforced **as not-clearance**: `index.ts:100-101`; proven by fixture `apps/arsy/test/public-projection-denial.test.ts:115-116` | `provenance-copy.ts:301` ("exact version not verified") | Trap worth recording: `corpus_editions.rightsStatus` **defaults** to it (`packages/moonql-corpus/src/index.ts:199`), so an unstamped edition fail-closes; `corpus_translations.rightsStatus` defaults to **cleared** (`:267`) — a translation row created without an explicit status is auto-cleared, mitigated only by the edition coupling at `:384`. |
| `PROPRIETARY` / `RIGHTS_CLEARED` / `LICENSED` / `RESTRICTED_METADATA_ONLY` | Not enforced by the corpus gate at all | `packages/core/src/tracing.ts:9,14,112`; `packages/types/src/domain/epistemic.ts:7`; `packages/testing/src/epistemic.ts:39`; `docs/decisions/ADR-0003-source-rights-and-consent.md:32` | A second, non-projection rights vocabulary lives in core/types/testing and is what the retired compare page used (`licenseStatus: 'RIGHTS_CLEARED'`). Inference: this parallel vocabulary is how a self-asserted clearance reached a public page once; `apps/arsy/test/testing-cli.test.ts:85` still asserts `licenseStatus === 'RIGHTS_CLEARED'`. |
| Review axis `PROPOSED / SOURCE_CHECKED / APPROVED_FOR_CITATION / DEPRECATED` (+ null → `reviewUnreviewed`) | `packages/moonql-unilex/src/index.ts:179-180,759-767` for `/orm/unilex/terms`; graph release membership `apps/arsy/test/public-projection-denial.test.ts:679` | `provenance-copy.ts:305-311,327-330` | Enforcement is per-endpoint, not uniform — see the four permissive surfaces in §6. |
| `SOURCE_AVAILABLE / SOURCE_MISSING / UNKNOWN / METADATA_ONLY` visibility axis | no code | `BLUEPRINT.md:240` | Plan-level naming only; not a projection enum. |

## §6 Rights-negative test evidence

Executed in this audit, all read and run:

- `apps/dock/test/reader-rights.test.mjs` — 5/5 pass. Blocks a rights-blocked render only by **regex on source**
  (`:18-35`); no render/assert on a real payload.
- `apps/dock/test/research-public-withholding.test.mjs` — 3/3 pass. `/reader/compare` + `/research` source-contract
  (`:12-22`) and the en/id D08 notice (`:24-33`).
- `apps/arsy/test/public-projection-denial.test.ts` — 14 pass, 1 skip.
  Denial coverage: no-governance proof `:195-229`; guessed citation vs four uncleared statuses `:232-273`; malformed /
  injection-shaped citations `:274-339`; guessed edition code / stable id / passage id `:340-420`; UNILEX
  `APPROVED_FOR_CITATION` actually enforced `:421-491`; graph release membership `:679-767`; byte-leak control markers
  `:96-100` with positive control `:224-228`.
- `apps/arsy/test/corpus-reader.test.ts` — 6/6 pass (`:81` REST/views expose no bytes without a session;
  `:96` rights-unknown edition is metadata-only including its translations; `:142` rights-unknown translation withheld
  even on a cleared edition; `:64` absent/malformed never invents a verse).
- `apps/arsy/test/corpus-browse.test.ts` — 6/6 pass (`:191` browse is not a text exit; `:353` uncleared edition listed
  as uncleared with the export reason; `:453` reader stays the only text exit under attack).
- `apps/arsy/test/corpus-ingestion.test.ts` — 2/2 pass (`:53` idempotent sync + rights veto for unverified editions).
- Read, not executed: `apps/dock/test/provenance-evidence.test.mjs` (labeling parity for all five rights codes,
  `:96-110`), `apps/dock/test/reader-static-structure.test.mjs` (`:106,118-120`).

Gaps and negative findings that are **not** covered by a green row:

1. **The only genuine D08-denial test is skipped**: `apps/arsy/test/public-projection-denial.test.ts:1251` —
   `test.skip('UI-P05e NOT SATISFIED: …')`, with the reason spelled out at `:1252-1265`. Correctly skipped (nothing to
   deny against), but it means "unapproved projection denied" is **unproven**, as G02's DoD requires.
2. **Confirmed live text leak, public routes, no rights veto on the research side**:
   `apps/arsy/test/public-projection-denial.test.ts:1015-1140` (title itself says "LEAK (CONFIRMED)"; passes in this run).
   - `corpus_translations` raw REST is 401 for anonymous `:1025-1027`, yet `/orm/research_claims` `:1033-1036` and
     `/orm/research_witnesses` `:1037-1043` return the same licensed text verbatim (`ADMIN_WRITE` does not gate list/get).
   - `/orm/research/case` `:1051-1063` and `/orm/research/trace` `:1064-1066` re-emit it while self-reporting
     `rawTextExposed: false` — a contradicted self-report.
   - The research surface applies **no** rights veto: a synthetic `rightsSnapshot: 'RIGHTS_UNKNOWN'` case
     (`:1107-1135`) is served publicly, while `/orm/corpus/reader` for the same address returns `rights_blocked`
     (`:1137-1139`).
   - Public exposure is by registration: `packages/moonql-research/src/index.ts:652-653,660-661,671-672,682-683,693-694`
     (`/research/overview|case|metrics|trace|hypotheses` all `requires: 'public'`).
   - The leak is *scoped* by the same test: aggregate surfaces stay clean (`:1100-1102`).
3. Other permissive-today surfaces named at `public-projection-denial.test.ts:1256-1263`
   (`/orm/unilex/term` skips the citation filter; `/orm/ontology/constellation` mirrors the ADMIN_ONLY conflicts list;
   `/orm/graph/relation` serves PENDING candidates anonymously) and `:876` (raw REST reads on projection source tables).
4. Dock has **no payload-level or browser-level** rights-denial test: `reader-rights.test.mjs` is source-regex only, so
   a projection regression that shipped text under `state: 'available'` with a stale `rightsStatus` would be caught only
   hub-side, not Dock-side. No `/reader/compare` data test is possible (no data path).

## §7 Verdict

| DoD clause (verbatim from `todo-ui-2.md:31`) | Status | Evidence |
|---|---|---|
| "Verify source rights gate" | **Met by this audit**, gate itself sound for `/corpus/reader` | §1; hub tests in §6 all pass |
| "QS 2:82 edition grants" | **Partially verifiable; contradictions open** | §3 — 1 edition + 1 translation cleared in seed; `M06-01:16` says METADATA_ONLY/CC-BY-SA; `M34-02:144` NA-4 open; "six editions" have no data owner |
| "D08 public denial rules" | **BLOCKED — no object exists** | §4 (no governance package, no D08 tables, model lookup throws) and §6.1 (the denial test is skipped) |
| "rights-negative tests" | **Partially met, not complete** | 36 hub + 8 Dock assertions pass (§6); the one test that would prove an unapproved projection is denied is `test.skip` |
| "rights ledger" | **Met by this document** | §5 |
| "M19-19 remains open until true D08 projection" | **Satisfied as written — M19-19 is and must stay open** | `TODO.md:468`, `docs/audit/M19-19-research-public-withholding.md:27`, `M27-08-readiness-blocker-2026-10-27.md:8` |

**G02 cannot honestly be ticked.** Recommended state: **BLOCKED / inventory complete**, not closed.

Reasons, in order of weight:

1. D08 — one of the three things G02 is told to verify — has zero implementation. A gate that does not exist cannot be
   verified, and its negative test is skipped by design (§4, §6.1).
2. The "before expanding Reader or HQ publishing" precondition is *actively violated* by observed behavior: licensed
   QS 2:82 translation text is publicly readable through `/orm/research/case`, `/orm/research/trace` and raw
   `research_claims` / `research_witnesses` REST reads, with a self-report that says no raw text is exposed (§6.2).
   No reader/HQ publishing surface that consumes research projections should be expanded until that is denied.
3. The QS 2:82 grant ledger is internally inconsistent across seed, pin inventory and research seed, and no D08 rights
   record backs it (§3).

What is genuinely bankable from this gate: the `/reader/compare` hardcoding defect is fixed and regression-guarded at
`49ec20e` (§2), the corpus text exit is fail-closed and well covered (§1, §6), and the ledger (§5) is complete.

Prerequisites before G02 can close: M34-04 (D08 projection specification) landed and accepted; the research-side leak
either vetoed or moved behind a non-public requirement, with a positive+negative pair at exact SHA; NA-4 resolved with
an artifact that is not repo-local seed; the skipped `public-projection-denial.test.ts:1251` turned into a real denial
assertion. M19-19 stays open throughout, and M27-08/G15 stay blocked behind it.
