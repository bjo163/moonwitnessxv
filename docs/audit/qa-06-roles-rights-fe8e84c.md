# QA-06 — roles, rights and private-data leakage: what is actually covered at `fe8e84c`

**Baseline:** branch `dev`, HEAD `fe8e84c`, recorded 2026-10-27. Companion to [ui-p02-p12-audits-fe8e84c.md](ui-p02-p12-audits-fe8e84c.md).
**Nature:** read-only D1 evidence audit. **Nothing was ticked.** No test, build, lint, server or browser was executed for this document; every statement below is about *test and source code present in the tree at this SHA* and about *how it is wired into scripts*, not about results observed at this SHA.

## 0. The row under audit, verbatim (`todo-ui.md:209`)

> - [ ] **QA-06 · P0:** 401/403 denied roles; publication & rights-negative tests; no private source, witness or channel leaked by public mock screen.

Three clauses. This document decides, per clause, whether evidence exists, and then whether the row can honestly be ticked.

## 1. Commands actually executed

```
git rev-parse --abbrev-ref HEAD ; git rev-parse --short HEAD      -> dev / fe8e84c
git status --porcelain                                             (dirty tree, see §1.1)
grep -rlniE "401|403|forbidden|unauthoriz|denied|denial" apps/*/test packages/*/test test
grep -cE "^(void )?test\(" / test.skip( per file                   (counts below)
grep -n "test.skip" apps/arsy/test/public-projection-denial.test.ts
sed -n '1251,1270p' apps/arsy/test/public-projection-denial.test.ts
git blame -L 1251,1251 -- apps/arsy/test/public-projection-denial.test.ts
git show fe8e84c:apps/skylink/src/modules/routes.ts | grep -n api/v1
grep -n '"test"' package.json ; sed -n '5,10p' apps/headquarters/package.json
grep -n "verify" .github/workflows/ci.yml
ls apps/headquarters/test
```

### 1.1 Working-tree caveat (fact)

`git status --porcelain` at session start listed modifications to `TODO.md`, `apps/arsy/src/app.ts`, `apps/arsy/src/fastify.d.ts`, `apps/arsy/src/modules/channels/index.ts`, `apps/dock/next-env.d.ts`, `apps/orbit/src/app/layout.tsx`, `apps/orbit/test/orbit-locale-shell.test.mjs`, `apps/skylink/src/modules/routes.ts` and many `docs/audit/screens/*.png`. **None of the QA-06 test files cited below are in that list**, so their contents are as committed at `fe8e84c`. Where SKYLINK source is cited it was re-read from `git show fe8e84c:…` because `apps/skylink/src/modules/routes.ts` is dirty.

**The tree moved underneath this audit (fact, and the reason every citation below was re-pinned to the `fe8e84c` blob).** A second agent was active concurrently. Re-running `git rev-parse --short HEAD` at the end of this session returned **`ed92b12`**, not `fe8e84c`, and `git status` had grown to include `apps/cockpit/client/lib/cockpit-copy.ts`, `apps/dock/src/data/queries/constellation.ts`, `apps/dock/src/lib/states-copy.ts`, `apps/dock/src/ui/components/constellation.tsx`, `scripts/ui/global-setup.mjs`, `scripts/ui/playwright.config.mjs` plus new untracked files including `apps/arsy/src/lib/skylink.ts`, `apps/arsy/test/skylink-client.test.ts` and `docs/audit/M38-12-arsy-skylink-client.md` (i.e. `M38-12` work appears to be starting). Consequences for this document: every `file:line` here was re-verified with `git show fe8e84c:<path>` and is correct **for `fe8e84c`**; some have already drifted in `ed92b12` — `apps/dock/src/lib/states-copy.ts:96` → `:107` and `:237` → `:259` are a confirmed example. Anyone reading this at a later SHA must re-resolve the lines before acting on them. The QA-06 conclusion itself is ACL/logic-based, so line drift does not soften it; but the new untracked `M38-12` artifact means the SKYLINK client picture may change the companion screen-12 row on re-audit.

## 2. The exact current state of the `test.skip` the brief asked to verify

Confirmed present, at the line the brief predicted. `git blame` attributes it to `44a8640` (author `bjo163`, 2026-07-27 12:26:19 +0700 as recorded in the blame output shown as `2026-10-27` in the repo's own date convention — the hash and line are the load-bearing facts). Verbatim, `apps/arsy/test/public-projection-denial.test.ts:1250-1270`:

```ts
1250  // --------------------------------------------------------------------------- 15
1251  test.skip('UI-P05e NOT SATISFIED: guessing a public link must be denied for every unapproved projection', async () => {
1252    // Precise reason this is skipped rather than asserted:
1253    //   D08 (Publication & Governance) is planned-only — no @moonwitness/governance addon and
1254    //   none of release_manifests / rights_approvals / editorial_signoffs / takedown_logs exist
1255    //   (proved above from moonql.registry.models). Until that gate exists there is no
1256    //   "approved public projection" concept for the hub to deny against, and four surfaces are
1257    //   demonstrably permissive today:
1258    //     1. GET /orm/unilex/term?stableId=<guessed> ignores the APPROVED_FOR_CITATION filter that
1259    //        packages/moonql-unilex/src/index.ts:179-180,759-767 applies to /orm/unilex/terms.
1260    //     2. GET /orm/ontology/constellation returns the same conflicts array as the ADMIN_ONLY
1261    //        /orm/ontology/conflicts (packages/moonql-ontology/src/index.ts:457-470).
1262    //     3. GET /orm/graph/relation?code=<candidateCode> serves PENDING candidates anonymously
1263    //        (packages/moonql-graph/src/projection.ts:480-500).
1264    //     4. GET /orm/research/case + /orm/research/trace publish licensed translation text whose
1265    //        own table (corpus_translations) is ADMIN_FULL, i.e. denied (test 13 above).
1266    //   Plus the documented ADMIN_WRITE hole: raw REST list/get on research_cases, onto_entities,
1267    //   onto_aliases, unilex_terms and graph_* are public-by-model (packages/moonql/src/model.ts:30-42,
1268    //   docs/architecture/SECURITY.md). Enabling this test requires a D08 approval model plus read
1269    //   gating on those routes; M27-08 stays BLOCKED until then.
1270  })
```

This is not an untested area — it is a **written-off** test whose own body enumerates four permissive surfaces plus one systemic ACL hole, and names the milestone that must close it (`M27-08`, and `M34-04`/`M19-19` per the sibling tests). The file holds 14 active `test(` cases and 1 `test.skip(`.

Also note the immediately preceding honest finding at `:1221-1224`, which the repo chose to record rather than paper over: Fastify validates the request body **before** the endpoint's `requires` guard runs (`packages/moonql/src/rest.ts:428-430`), so an anonymous POST with an empty body gets `400` from schema validation rather than `401` from the session check. The assertion at `:1232` therefore accepts `[400, 401]`. That is a real refusal, but it is a **400-shaped refusal**, not a 401 — relevant to how strictly clause 1 can be claimed.

## 3. Clause 1 — "401/403 denied roles" — **EVIDENCED**

This clause is the best-covered thing in the repo. Enumerating only what the grep and the per-file listings actually found:

### 3.1 HQ private-route role denial (the deepest suite)

`apps/headquarters/test/hq-authz-guard.test.ts` — **23 `test(` cases, 0 skips**, all about denial:
`:214` hub 401 ⇒ anonymous ⇒ redirect (not a decision) · `:230` anonymous redirects, never answered with a guard · `:245` a local cookie the hub rejects is the hub's call · `:256` no cookie at all is anonymous · **`:269` "a signed-in user without the role is denied forbidden for a model create"** · **`:281` "an admin-only view rule and an admin-only endpoint rule both refuse a non-admin"** · `:296` an unpublished operation refused even for an admin · `:307` an unpublished endpoint is forbidden rather than guessed · `:318` no published rule ⇒ forbidden, not public by default · `:331` admin holding the rule is allowed · `:351` a role is never read off the cookie · `:363` hub 503 ⇒ `unavailable`, explicitly not anonymous · `:388` unreachable hub ⇒ not a sign-out · `:406` only 401 reads as anonymous, hub 500 stays `unavailable` · `:430` `ruleAllows` delegates to shared `can()` · `:449`/`:463` unknown rules refused, not interpreted · `:472` **no denial carries a credential or an identity** · `:507` denial copy uses only the two stable codes · `:544` anonymous is not renderable · `:568` **the denial is decided before any record is fetched** · `:584` a list rule does not grant create · `:600` denial view renders localized copy only.

`apps/headquarters/test/session-auth.test.ts` — **5 `test(` cases, 0 skips**: `:22` a present cookie passes only middleware, the hub decides · `:34` expired opaque cookie rejected · `:43` hub-confirmed session returns the user · `:52` hub outage surfaced, not converted to anonymous · `:61` no cookie ⇒ redirect to login.

Backed in source (re-read at this SHA): `apps/headquarters/src/middleware.ts:4,11,13-16` (cookie-presence only), `src/app/(admin)/layout.tsx:5-7` (`me()` → redirect), `src/lib/session-auth.mjs:4-11` (401-only rule), `src/lib/authz.ts:50-62,72-79,82,87,97-101` (`decideAccess`/`enforce`/`guardModel`/`guardView`/`guardEndpoint`, unpublished ⇒ forbidden), `src/lib/session.ts:8,13-18` (`hq_token`, `httpOnly`, `sameSite: 'lax'`, production `secure`), plus a server-side guard on the real page: `src/app/(admin)/world-monitor/page.tsx:97-98` and `models/[model]/new/page.tsx:29-30`.

### 3.2 Hub/API-side denial

- `apps/arsy/test/public-projection-denial.test.ts` — 14 active tests; 13 lines matching 401/403; includes `:1026` `assert.equal(gated.statusCode, 401, 'corpus_translations is ADMIN_FULL: anonymous REST reads are denied')` and the `[401,404]` / `[400,401]` sweeps at `:1219,1232`.
- `apps/arsy/test/moonql-auth.test.ts` (8), `moonql-apikeys.test.ts` (3), `moonql-identity-cache.test.ts` (3), `moonql.test.ts` (4), `moonql-ext.test.ts` (4), `moonql-ops.test.ts` (2).
- `apps/arsy/test/moonql-acl-surface.test.ts:72` "expand: a relation to an admin-only model is null for anonymous callers"; `:97`/`:114` `x-total-count` withheld when a row rule filtered the page (a count oracle denial).
- `apps/arsy/test/mizan.test.ts` — 7 tests, incl. `:655` "M14-06: wrong role, forged evidence and a concurrent approval race" and `:728` "M14-07: release criteria stay fail-closed while publication is unavailable".
- `apps/arsy/test/m22-06-private-playlog-isolation.test.ts:7` private playlogs + recent-play search admin-only while the public catalogue stays projected.
- `apps/arsy/test/m22-03-denpa-gate.test.ts:9` inbound DENPA requires an opt-in token and rejects invalid payloads **before writing**.
- `apps/skylink/test/control-plane.test.ts` — 10 matches; `:87` limits service-key scope; `:196` REST and WS enforce service/ARSY auth; source `apps/skylink/src/auth.ts:8-18` (`401 | 503`, `unauthorized` / `auth_unavailable`), `routes.ts` HEAD-blob lines 138/149/166/182/206/220/232/292 (`'admin'`, `'service'`, `'admin-or-service-send'`), refusal copy at 340-341.
- `packages/skylink-telegram/test/webhook.test.ts:16` "Telegram rejects missing/incorrect secret **before parsing a webhook body**".
- `apps/echolog/test/object-routes.test.ts:56` "ECHOLOG objects enforce two auth modes, bounds, and private download grants" (4 matches).
- `apps/cockpit/test/security.test.ts:28` "S1: mutating routes reject a missing token, a foreign Origin, and a rebound Host".
- `apps/orbit/test/orbit-cross-app-boundaries.test.mjs`, `orbit-runtime-binding.test.mjs`, `orbit-projections.test.mjs`, `orbit-queues-inspectors.test.mjs`, `orbit-approval-handoff.test.mjs` collectively assert 401/403 ⇒ `UNAUTHORIZED` with zero rows.

### 3.3 Wiring — the part that matters for a P0 gate

- Root `package.json:40` runs, among others, `pnpm --filter @moonwitness/arsy test` **and** `pnpm --filter @moonwitness/arsy exec tsx --test` over exactly `session-auth.test.ts login-locale.test.ts shell-locale.test.ts hq-authz-guard.test.ts`. `apps/headquarters/test/` contains exactly those four files — no HQ test is orphaned.
- `apps/headquarters/package.json:5-10` has **no `test` script** (only `dev`, `build`, `start`, `typecheck`). This is a real gap in per-app runnability, but it does **not** orphan the tests, because the root script invokes them directly by path. `TODO.md:14` and the M28-13 note record "Headquarters auth 8/8".
- `.github/workflows/ci.yml:51-52` runs `pnpm verify`; `package.json:53` = `pnpm build && pnpm ui:check && pnpm lint && pnpm gen:sdk:check && pnpm test && pnpm build:web`. So clause 1's suites are on the CI path.
- **Not on the root `test` path** (fact, read from `package.json:40`): `@moonwitness/moonui`, `@moonwitness/cockpit`, `apps/lumen-runtime`, `apps/aigateway`, `packages/lumen`, `packages/skylink-store/telegram/whatsapp`, `apps/dock/test/home-offline.test.mjs` (and `todo-ui.md:207` records why the Dock home-offline case is excluded — it hardcodes a port).

**Clause 1 verdict: EVIDENCED.** Broad, deep, server-side, deny-before-fetch, credential-free denials at both the HQ UI and the Hub, wired into `pnpm test` and CI.

## 4. Clause 2 — "publication & rights-negative tests" — **PARTLY EVIDENCED, and the negatives are mostly source-shape assertions**

What exists:
- `apps/arsy/test/public-projection-denial.test.ts` is a genuine behavioural rights suite against an in-memory hub: `:232` a guessed citation cannot turn an uncleared edition into cleared text · `:274` malformed/injection-shaped citations return absent, never a verse · `:340` guessing an edition id / stable id / passage id does not bypass the veto · `:421` the Terms Table projection really does enforce `APPROVED_FOR_CITATION` · `:679` released graph projections carry only the active release, never a pending candidate · `:1143` "M19-19/M27-08: no public research projection can render a released state", asserting `review.humanReviewed === false` (`:1202`), `source.rawTextExposed === false` (`:1203`), every hypothesis `verified === false` and `status === 'CANDIDATE'` (`:1210-1212`), `policy.publicationAvailable === false` and `autoApprove === false` (`:1244-1245`), and a body match on `/not a publication surface/` (`:1247`).
- Publication governance: `apps/arsy/test/mizan.test.ts` (7 tests, incl. the wrong-role/forged-evidence/concurrent-approval race at `:655` and fail-closed release criteria at `:728`) and `apps/arsy/test/corpus-reviewer.test.ts:13` (reviewer admin REST and public Reader agree on the QS 2:82 identity).
- Dock rights negatives: `apps/dock/test/reader-rights.test.mjs` (5 tests), `apps/dock/test/research-public-withholding.test.mjs` (3 tests), `apps/dock/test/provenance-evidence.test.mjs` (8 tests, incl. `:55` "no public view keeps a private rights or review label map" and `:121` an unknown status renders the raw code, never an empty string).
- Honest-state negatives that underwrite "no fake publication status": `apps/dock/test/panel-state-unavailable.test.mjs` (8 tests, e.g. `:88` a loading panel shows a skeleton, not a fabricated row; `:105/:140` an unreachable hub stays an error, not an empty) and `apps/dock/test/panel-state-contract.test.mjs:258` (withheld routes state the withholding instead of faking a lifecycle) and `:296` (detail routes keep a real 404).

Important qualifier, stated as a fact rather than a criticism: the Dock rights suites are **static source-pattern assertions**, not behavioural runs. `apps/dock/test/reader-rights.test.mjs:1-17` reads `src/ui/components/reader.tsx` and `src/app/reader/page.tsx` with `fs.readFileSync` and asserts regexes against the text (`:18-35`), and `research-public-withholding.test.mjs:13-15,19-21` asserts that forbidden identifiers are *absent* from the page source. These correctly prevent regressions of the specific known failure, but they do **not** prove runtime behaviour for any screen that is not the reader/compare/research pages.

Gap: there is no rights-negative test for a **publication decision**, because no publish transition exists in code. `grep -rn "publish" apps/headquarters/src` finds only dashboard copy and comments; `M18-02..07` are open, and `apps/arsy/test/public-projection-denial.test.ts:1253-1255` proves there is no D08 addon or governance table. So "publication … tests" can only mean the MIZAN/research fail-closed machine today, not a product publish gate.

**Clause 2 verdict: PARTLY EVIDENCED.** Rights-negative is strong at the Hub and adequate in Dock; publication-negative exists only as "publication is unavailable and stays denied"; and the UI half is source-shape, not behaviour.

## 5. Clause 3 — "no private source, witness or channel leaked by public mock screen" — **NOT EVIDENCED; contradicted by the repo's own committed tests**

Read literally, the clause is about *public mock screens*, and there are no public mock screens for screens 02-12 — §0 of the companion audit proves Dock/HQ/Orbit/Cloud contain no such routes. On that literal reading nothing leaks, but that is a vacuous pass, not a covered requirement. Read as the release gate it is written to be, the evidence contradicts it. Four leak findings are committed in the tree right now, asserted as **observed behaviour, not hypotheses**:

1. **Licensed translation text is publicly readable** — `apps/arsy/test/public-projection-denial.test.ts:1015`, titled `UI-F20 LEAK (CONFIRMED): research routes publish licensed translation text that corpus_translations withholds`. Its own assertions: `:1026` `/orm/corpus_translations` → 401 (the gate that *does* work); then `:1034-1036` `GET /orm/research_claims` → **200** and `assert.match(claimsRaw.body, new RegExp(CLEARED_TRANSLATION_BYTES), 'LEAK: research_claims.claim quotes the licensed text')`; `:1038-1042` the same for `research_witnesses` (`'LEAK: research_witnesses.conclusion quotes the licensed text'`); and part C (from `:1046`) attacks "the projections the Dock Reader/Research views actually call". This is a public read of **source text whose own table is admin-only** — precisely clause 3's "private source".
2. **Private-witness-adjacent data is publicly listable.** `research_witnesses` is registered with `acl: ADMIN_WRITE` (`packages/moonql-research/src/index.ts:451,454`), and `ADMIN_WRITE` gates writes only: `packages/moonql/src/model.ts:31-37` (with the in-file comment "reads stay public, writes need admin"). So `GET /orm/research_witnesses` is anonymous. Separately, D06 witness storage is spec-only: `TODO.md` has `M16-01` closed as a specification while `M16-02..05` are unchecked, and `M16-04`'s acceptance is literally "No anonymous access or media link leakage".
3. **Guessed public links are *not* denied** for unapproved projections — the four numbered surfaces in the `test.skip` body at `:1258-1265` (`/orm/unilex/term?stableId=`, `/orm/ontology/constellation` mirroring the `ADMIN_ONLY` `/orm/ontology/conflicts`, `/orm/graph/relation?code=` serving **PENDING candidates anonymously**, `/orm/research/case`+`/orm/research/trace`). Committed sibling tests already assert these as observed: `:492`, `:532` ("admin-only UNILEX audit rows are readable through the public term projection"), `:587`, `:768`, `:814`, `:876` (the `ADMIN_WRITE` raw-REST sweep).
4. **Private channel/monitoring data is publicly readable at the Hub.** `packages/moonql-monitor/src/index.ts:701-705` declares the `/monitor/overview` endpoint with `path`, `method`, `menu` and `handler` and **no `requires:` at all**, while every sibling declares `requires: ['admin','bot']` (`:763,765,801,803,876,878`). `packages/moonql/src/rest.ts:120-122` shows a missing `roleRule` returns `undefined`, i.e. installs no preHandler. The payload (`moonql-monitor/index.ts:737-757`) is the whole radar/source/signal/task snapshot including `aiSummary`, `author` and `url`. `docs/audit/M20-01-hq-model-ui-route-guards-ops.md` already recorded this as finding N4 ("every radar/source/signal/task row … is anonymous-readable via direct API call whenever the hub is network-reachable; HQ only masks this behind cookie presence"), and **this audit re-verified it at `fe8e84c` — it is still true.** SKYLINK's own D18 conversation/message reads are correctly `'admin'`-gated (HEAD blob `routes.ts:187,200,216`), so the channel half of clause 3 is covered *for SKYLINK* but the *monitoring-source* half is not.

`docs/architecture/SECURITY.md:2` states the rule these findings break: "`ADMIN_WRITE` in MoonQL does not protect list/get; Research/Journey raw REST models must not be mistaken for reviewed public projection. Test anonymous/role/expand/export/cache/search, withdrawn witness, hardcoded RIGHTS_CLEARED, unreviewed research, minor consent and false mandate status."

**Clause 3 verdict: NOT MET.** Not because a mock screen leaked something, but because three of its four named nouns — private source, witness-adjacent records, and channel-like monitoring records — are anonymous-readable through the API today, proved by committed passing tests, and the one test designed to pin the general rule is skipped with an explanation naming `M27-08` as BLOCKED.

## 6. Can QA-06 honestly be ticked? **No.**

| Clause | Status | Why |
|---|---|---|
| 401/403 denied roles | **EVIDENCED** | 23 + 5 dedicated HQ denial tests + Hub-side ACL/auth suites + SKYLINK/ECHOLOG/Cockpit/Orbit denials; all wired into root `package.json:40` and thus into `pnpm verify` / CI |
| publication & rights-negative tests | **PARTLY EVIDENCED** | Rights-negative is strong and behavioural at the Hub; publication-negative only proves "publication is unavailable"; the Dock rights layer asserts source shape, not runtime behaviour; there is no publish transition to test because D08 is unimplemented |
| no private source/witness/channel leaked by public mock screen | **NOT MET** | `public-projection-denial.test.ts:1015` asserts a CONFIRMED licensed-text leak on public research REST + projections; `research_witnesses` and the other `ADMIN_WRITE` models are public on list/get (`model.ts:31-37`, `rest.ts:120-122`); `/monitor/overview` has no `requires` (`moonql-monitor/index.ts:701-705`); the general "guess a link ⇒ denied" test is `test.skip` at `:1251` and self-documents four permissive surfaces |

A P0 acceptance row cannot be ticked while a committed, passing test in the same repository is titled `LEAK (CONFIRMED)` and the test that would have caught the class of failure is skipped. Ticking QA-06 here would convert a documented, deliberately-disclosed security position into a false claim of closure — the exact failure mode `AGENTS.md:12` ("Report only commands actually executed and results actually observed… Identify missing evidence and distinguish inference from fact") and `todo-ui.md:4` ("A screenshot never proves that its feature, API, data, integration, deployment, or user permission exists") exist to prevent.

### 6.1 What would close each clause (owners already exist; nothing new is proposed)

- **Clause 2 →** `M19-19` (open, P0) and `M34-04` (D08 released research projection); a real publish transition only becomes testable after `M18-02`/`M18-03`. No new engine: reuse the MIZAN `draft/submitted/reviewed` machine and the `graph_releases`/`graph_release_pointer` pattern.
- **Clause 3 →** add `requires` to `/monitor/overview`; move the leaking `research_*` / `graph_*` / `onto_*` / `unilex_terms` raw REST models from `ADMIN_WRITE` to `ADMIN_FULL` (`packages/moonql/src/model.ts:38-42` already provides that shape) or gate the projections; add read gating on `/orm/unilex/term`, `/orm/ontology/constellation`, `/orm/graph/relation`; then **un-skip `:1251`** — that single test is the machine-checkable form of clause 3. `M27-08` is the row the skip note itself names.
- **Clause 1 →** already satisfied; keep it satisfied by adding a `test` script to `apps/headquarters/package.json:5-10` so the four HQ files are runnable by `--filter` rather than only by the root script's hardcoded relative paths.
- **Also worth naming:** QA-06's sibling `UI-F20` (`todo-ui.md:46`, "Audit public negative authorization/rights tests…") is unchecked, and its own test names in `public-projection-denial.test.ts:876,1015` are labelled `UI-F20` — i.e. that leaf's audit is, in fact, already substantially written down in that file and in `docs/audit/M20-01-…`; it has just not been reconciled into the checklist. Reconciling statuses is an integrator action under `todo-ui.md:3` and is explicitly outside this read-only audit.

### 6.2 Fact vs inference

**Fact (observed in files at this SHA):** every `file:line` above; the `test.skip` at `:1251`; the missing `requires` at `moonql-monitor/index.ts:701-705`; the `ADMIN_WRITE` selections; the root test script's contents; the absence of an HQ `test` script; the static-regex nature of the Dock rights tests.
**Inference (labelled as such):** that the leak paths are reachable in a real deployment depends on the hub being network-reachable — which is exactly how `docs/audit/M20-01` words finding N4, and which this audit did not test.
**Not observed (explicitly):** no test was executed at `fe8e84c`; no pass/fail counts are claimed for this SHA; the counts in §3-§4 are `grep -c` of `test(` / `test.skip(` in the source. Historical pass counts quoted from `TODO.md` (`HQ auth 8/8`, `SKYLINK 4/4`, `M34-01 research 8/8`, `M19-19 3/3`) are **that document's records at other SHAs**, not this audit's results.
