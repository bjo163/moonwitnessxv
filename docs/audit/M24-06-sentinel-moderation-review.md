# M24-06 — Review YouTube Sentinel moderation, appeal, classification lens

- **Task:** M24-06, P2/D4; prerequisites M24-01 and M03-06 are checked in [TODO](../../../TODO.md).
- **Baseline:** `18cca2f78a567774b407c33483e75d5619390b11` on `dev`, shared dirty working tree (pre-existing changes in unrelated paths were left untouched).
- **Worker:** single-owner leaf worker, artifact-only.
- **Reviewer:** **UNASSIGNED** — the integrator must assign a human reviewer. This review is AI-assisted; it is not a human rights or privacy review and does not grant source or platform rights.
- **Result SHA:** uncommitted at the time of writing; no integrated SHA is claimed.
- **Scope:** read-only inspection of `apps/sentinel/src/**`, `apps/sentinel/package.json`, `apps/sentinel/test/*.test.ts`, plus the Hub monitor addon and the Headquarters World Monitor surface where they receive or display Sentinel output. Two new test-only files encode the findings; **no production behaviour was changed**.

## 1. Observed code facts

| Finding | Evidence (`file:line`) | Short verbatim quote |
|---|---|---|
| The worker has exactly one cycle shape: claim, collect, ingest. | `apps/sentinel/src/index.ts:111`, `:126`, `:142` | `await client.call('/monitor/claim'` · `driver.collect(` · `await client.call('/monitor/ingest'` |
| Ingest carries metadata and counters only; no comment body, moderation verdict or action field. | `apps/sentinel/src/index.ts:148-157` | `commentsCount: sig.commentsCount ?? 0,` |
| The signal model has four sentiment labels and numeric counters; no claim type, provenance or uncertainty field. | `apps/sentinel/src/types.ts:3`, `:30-43` | `export type SentimentKind = 'positive' \| 'neutral' \| 'critical' \| 'alert'` |
| YouTube is read through Atom/RSS; the parser hardcodes `commentsCount: 0` for feed entries and items. | `apps/sentinel/src/drivers/youtube-rss.ts:70`, `:100` | `commentsCount: 0,` |
| No YouTube Data API, OAuth, comment-thread, report-abuse or video write call exists in Sentinel. | `grep -rniE "commentThreads\|youtube/v3\|oauth\|googleapis\|reportAbuse\|videos\.(delete\|update\|insert)" apps/sentinel/src apps/sentinel/test` | `NONE` (command output) |
| All outbound methods in Sentinel are `GET` (feed reads) or `POST` (internal collectors, Hub auth/claim/ingest, alert sinks); there is no `PUT`, `PATCH` or `DELETE`. | `apps/sentinel/src/drivers/youtube-rss.ts:114`, `webhooks.ts:63`, `:81`; method list at `agent.ts:26`, `openclaw.ts:17`, `playwright.ts:18`, `index.ts:90`, `:112`, `:143` | `method: 'POST',` (only non-GET methods found) |
| The alert webhook is notification-only: Discord embed and Telegram text built from the captured signal. | `apps/sentinel/src/webhooks.ts:43-60`, `:78` | `title: \`[INTEL FLASH] ${signal.title}\`` · `*${signal.title}*` |
| The alert webhook has **no in-repo caller**: only a re-export exists. | `apps/sentinel/src/index.ts:18`; `grep -rn "dispatchCriticalAlert" apps packages` | `export { dispatchCriticalAlert, ... } from './webhooks.js'` |
| The alert threshold can be bypassed by the label `critical`/`alert`, not only by score. | `apps/sentinel/src/webhooks.ts:26`, `:29` | `if (urgency < minUrgency && signal.sentiment !== 'critical' && signal.sentiment !== 'alert')` |
| Headline classification is a three-group keyword heuristic over the title only. | `apps/sentinel/src/drivers/youtube-rss.ts:23-36` | `/(live\|session\|rilis\|concert\|vinyl\|dub\|ska\|open-source\|launch)/` |
| The agent driver asks an LLM for prose plus sentiment/urgency and interpolates source metadata into the prompt. | `apps/sentinel/src/drivers/agent.ts:34`, `:38`, `:55-57`, `:59-61` | `content: \`Source: "${source.name}" (Platform: ${source.platform}, Target: ...` |
| The agent driver's `fetch` is **not** guarded by `ctx.egressEnabled`, unlike the Playwright/OpenClaw/RSS collectors. | `apps/sentinel/src/drivers/agent.ts:13-25`; compare `playwright.ts:16`, `openclaw.ts:15`, `youtube-rss.ts:113` | `const res = await fetch(gatewayUrl, {` |
| LLM output is stored verbatim as `aiSummary`; the only parsing is regex sentiment/urgency extraction. | `apps/sentinel/src/drivers/agent.ts:84-86`; `index.ts:152` | `aiSummary: aiBrief ??` |
| When collection fails or egress is off, drivers emit fallback signals with invented engagement counts. | `youtube-rss.ts:136-138`, `playwright.ts:48-50`, `openclaw.ts:58-60`, `agent.ts:89-92` | `viewsCount: 1200,` · `commentsCount: 42,` · `commentsCount: 78,` · `commentsCount: 65,` |
| Geospatial clustering is exported but has no in-repo caller. | `apps/sentinel/src/radar.ts:35`; `grep -rn "clusterSignalsGeospatially" apps packages` | `export function clusterSignalsGeospatially(` |
| The Hub monitor schema has a `flagged`/`promoted` signal status and only a numeric `commentsCount`; ingest can create signals but has no moderation or status-transition route. | `packages/moonql-monitor/src/index.ts:33`, `:365`, `:421`, `:892`, `:946`; routes `:701`, `:762`, `:800`, `:875` | `const SIGNAL_STATES = ['new', 'analyzing', 'verified', 'flagged', 'promoted']` · `status: 'flagged',` (seed only) |
| Headquarters renders the free-form `aiSummary` under an `AI TRIAGE` label, while the "unreviewed claim" copy exists but is not imported anywhere. | `apps/headquarters/src/app/(admin)/world-monitor/page.tsx:400`, `:409`, `:419`; `apps/headquarters/src/lib/monitor-copy.ts:84` | `<strong>AI TRIAGE:</strong> {sig.aiSummary}` · `This is the aiSummary field stored on the record, reproduced verbatim.` |
| Existing Sentinel contracts are test-only and not production imports; the egress contract already denies punitive alerts. | `apps/sentinel/test/egress-policy-contract.ts:1`, `:81-82`; `observation-contract.ts:1-5` | `if (intent.capability === 'ALERT_SINK' && intent.alertAction !== 'NOTIFICATION')` · `return { allowed: false, reason: 'PUNITIVE_ALERT_FORBIDDEN' }` |
| The package `test` script enumerates three files; it does not include the new contract. | `apps/sentinel/package.json:20` | `tsx --test test/worker-log-contract.test.ts test/observation-contract.test.ts test/egress-policy-contract.test.ts` |

## 2. Moderation / appeal / classification surfaces

| Surface | Observed state at baseline | Classification |
|---|---|---|
| YouTube comment ingestion | Absent. Only a numeric `commentsCount` exists; RSS parsing hardcodes it to `0`, and no comment text, author, permalink or thread id is fetched. | **ABSENT** |
| Comment moderation (hide, hold, approve, remove, ban) | Absent. No moderation queue, verdict, reason code, actor or timestamp. | **ABSENT** |
| Video/channel report or takedown | Absent. No YouTube Data API/OAuth/write call and no `PUT`/`PATCH`/`DELETE`. | **ABSENT** |
| Appeal process | Absent. There is nothing to appeal because no punitive or moderation decision exists. | **ABSENT** |
| Automated punitive action | Absent by construction: Sentinel has no platform write path. It is **not** absent by an enforced runtime policy. | **ABSENT (unenforced)** |
| Alert webhook (Discord/Telegram) | Notification-only text/embed; exported but never called in-repo; embeds untrusted feed title/summary unescaped. | **NOTIFICATION-ONLY, unwired** |
| Human approval / reviewer gate | Absent from the worker. Nothing asks a human before ingest, classification, alert formatting or fallback emission. | **ABSENT** |
| Automated classification | Advisory sentiment label and 0–100 urgency from title keywords, or from an LLM reply parsed by regex. No truth, guilt or orthodoxy verdict. | **AUTOMATED, ADVISORY** |
| Claim type / epistemic class / uncertainty | Absent from the ingested signal model. `observation-contract.ts` defines epistemic classes but is explicitly test-only and unwired. | **ABSENT** |
| "Flagged"/"promoted" record status | Hub enum only; Sentinel never writes it; seeded rows use it; no transition endpoint. | **DATA LABEL, no workflow** |

## 3. Risk register and current denial

### 3.1 Automated punitive action
- **Observed denial:** Sentinel can only read feeds and POST metadata to the Hub. There is no report/takedown/hide/ban call (`index.ts:111-162`; method inventory above). The only mention of punitive action is a test-only egress-contract denial (`egress-policy-contract.ts:81-82`).
- **Gap:** the denial is an absence of code, not a production invariant. Nothing in `apps/sentinel/src` would stop a future driver from adding a write call, and the egress contract is not imported by any production path (`egress-policy-contract.ts:1`). There is no appeal surface for any future action. The new contract encodes the policy but is likewise test-only.

### 3.2 Prompt injection and untrusted content
- The agent prompt interpolates `source.name`, `source.platform` and `source.externalTarget`/`targetUrl` into a user message (`agent.ts:38`). Those values come from the Hub's `monitor_sources` record, not from the feed body, so they are operator-configured today; they are still unescaped text handed to a model.
- Feed titles and summaries are never sent to the LLM, but they are stored, displayed, and (if the webhook is ever wired) copied verbatim into Discord/Telegram payloads (`webhooks.ts:47-50`, `:78`). There is no escaping: RSS item summaries strip tags, while Atom descriptions and titles are only truncated (240/1000 chars) (`youtube-rss.ts:62`, `:64`, `:94`).
- The LLM reply becomes free-form `aiSummary` (`agent.ts:84-86`) and Headquarters renders it as `AI TRIAGE` without the unused "unreviewed claim" note (`page.tsx:419`; `monitor-copy.ts:84`). A successful injection can therefore place arbitrary prose in an operator surface; it cannot trigger a punitive action because none exists.
- **Gap:** the agent driver ignores `ctx.egressEnabled` (`agent.ts:13-25`), so "egress off" does not stop LLM egress. This is adjacent to the M24-03 egress task and is recorded here, not changed.

### 3.3 Theological certainty / unsupported classification
- Sentinel has no religious referent and no truth classifier. Its labels are sentiment and urgency (`types.ts:3`; `youtube-rss.ts:23-36`), and the Hub badge merely repeats the stored sentiment (`page.tsx:400`).
- **Gap:** the signal model has no claim type, basis, source-observation link or uncertainty qualifier (`types.ts:30-43`). Free-form `aiSummary`, feed titles and summaries can assert unqualified religious or factual certainty, and the only downstream guard is a label that says "AI TRIAGE"; the explicit "unreviewed claim" copy is dead (`monitor-copy.ts:84`, no imports). The regex heuristic can also misclassify: `/live/` matches substrings such as "delivery" (`youtube-rss.ts:32`).
- **Gap:** fallback paths fabricate views/likes/comment counts when a feed cannot be read (`youtube-rss.ts:136-138` and peers), which presents invented engagement telemetry as captured data and is a source of unsupported certainty independent of theology.
- The M24-01 A-L-L-A-H finding (`Acronym/referent separation`, `docs/decisions/M02-01-disambiguation-registry.md:22`) is respected in Sentinel: no code attaches a claim to the religious referent. This review did not find a theology-certainty assertion in Sentinel code; it found no mechanism that would prevent one.

### 3.4 Appeal and human rights
- M18-04's import-free lifecycle model (`packages/moonql-research/src/withdrawal.ts:49` — `['WITHDRAWAL', 'CORRECTION', 'TAKEDOWN', 'APPEAL']`) exists elsewhere, but Sentinel does not import that package (its dependencies are `@moonwitness/core` and `@moonwitness/moonql-client` only) and owns none of it. Any future Sentinel moderation would need an appeal path, a named reviewer and a reason record before it may act; today none exists.

## 4. Acceptance assessment

TODO acceptance: **"No automated punitive action or unsupported theology certainty"**.

- **Automated punitive action:** observed absent in Sentinel at `18cca2f` — no platform write API, no report/takedown call, no moderation queue; the only webhook is an uncalled notification sink. The acceptance holds **by absence**, not by an enforced production policy.
- **Unsupported theology certainty:** Sentinel's own classifier asserts no theological truth; it emits sentiment/urgency only. The acceptance holds **by absence of a claim surface**, but free-form `aiSummary` and unlabelled fallback telemetry remain unsupported-certainty vectors downstream.
- This is a review artifact, not a closure claim. No human reviewer or rights/privacy approval is recorded.

## 5. Recommendations (reviewer-scoped)

| ID | Recommendation | Suggested owner |
|---|---|---|
| R1 | Keep all platform-facing actions (report, takedown, hide, demonetize) out of Sentinel; if ever proposed, require an accepted ADR, an appeal record, a named human reviewer and an audit reason code first. | M24 / future ADR |
| R2 | Add explicit `claimType`, `classificationBasis`, provenance and uncertainty fields to the signal contract before any public World Monitor use; make "AI-only" classification visibly advisory. | M24-02 follow-up / M24-05 |
| R3 | Gate the agent driver behind `ctx.egressEnabled` and treat source metadata as untrusted prompt text (delimit/quote, forbid instruction-following, cap length). | M24-03 |
| R4 | Do not wire `dispatchCriticalAlert` until its payload escapes/limits untrusted title/summary and an operator approves the alert sink; keep it notification-only. | M24-03 |
| R5 | Replace or clearly label fallback signal counts; never let a synthetic fallback look like a captured observation. | M24-05 |
| R6 | Wire the existing "unreviewed claim" copy to the `AI TRIAGE` block, or remove the copy; label LLM prose as unverified in every surface. | M24-05 / HQ |
| R7 | Do not ingest YouTube comments until a moderation, retention, consent and appeal design exists; a counter is not moderation data. | future ADR |
| R8 | Assign a human reviewer for this artifact and record whether the "by absence" acceptance is sufficient or requires a runtime guard. | integrator |

## 6. Test-only evidence contract

`apps/sentinel/test/moderation-review-contract.ts` (zero imports, not wired to production) models the review as a pure decision:

`evaluateModerationAction({ actor, action, humanApproval, classificationBasis, claimType }) → { allowed, reason }`

- Actions: `NOTIFICATION`, `ALERT_WEBHOOK` (notification-only), and the punitive set `PUNITIVE_WEBHOOK`, `REPORT_TO_PLATFORM`, `TAKEDOWN`, `HIDE_CONTENT`, `DEMONETIZE`.
- Bases: `SOURCE_BACKED_PHYSICAL`, `HUMAN_REVIEW` (reviewed) versus `AI_ONLY`, `UNREVIEWED` (refused).
- Claim types: `PHYSICAL_OBSERVATION`, `SOCIAL_SIGNAL`, `THEOLOGICAL_UNCERTAINTY`, `THEOLOGICAL_CERTAINTY`.
- Reasons: `PUNITIVE_ACTION_FORBIDDEN`, `HUMAN_APPROVAL_REQUIRED`, `AI_ONLY_CLASSIFICATION_FORBIDDEN`, `THEOLOGICAL_CERTAINTY_FORBIDDEN`, `UNKNOWN_CLAIM_TYPE`, plus `UNKNOWN_MODERATION_ACTION`, `UNKNOWN_MODERATION_ACTOR`, `PERMITTED_BY_REVIEW_POLICY`.
- Ordering is deliberate: unknown claim type, then certainty denial, then unknown action/actor, then unconditional punitive denial, then classification-basis denial, then human gating for the alert webhook. A human approval cannot authorize a punitive action because no appeal surface exists.

`apps/sentinel/test/moderation-review-contract.test.ts` covers four positive tests (human-approved notification, automated source-backed physical observation, uncertainty-qualified theological-adjacent statement, human-approved notification webhook) and five negative tests (automated takedown/platform reports/hiding/demonetization, AI-only or unreviewed classification, punitive webhook, "certain" theological assertion, unknown claim type/action/actor).

## 7. Commands actually executed

| Command | Observed result |
|---|---|
| `pnpm --filter @moonwitness/sentinel test` | PASS — `tests 20`, `pass 20`, `fail 0`, `skipped 0` (the package script's three files; the new contract is not in that list). |
| `cd apps/sentinel && pnpm exec tsx --test test/moderation-review-contract.test.ts` | PASS — `tests 9`, `pass 9`, `fail 0`, `skipped 0`. |
| `cd apps/sentinel && pnpm exec tsx --test --test-name-pattern="^permits" test/moderation-review-contract.test.ts` | PASS — `tests 4`, `pass 4`, `fail 0` (positive cases). |
| `cd apps/sentinel && pnpm exec tsx --test --test-name-pattern="^denies" test/moderation-review-contract.test.ts` | PASS — `tests 5`, `pass 5`, `fail 0` (negative cases). |
| `pnpm --filter @moonwitness/sentinel typecheck` | PASS — exit 0 (`tsc --noEmit` for source and `test/tsconfig.json`). |
| `pnpm exec eslint apps/sentinel/test/moderation-review-contract.ts apps/sentinel/test/moderation-review-contract.test.ts` | PASS — exit 0, no diagnostics. |

No network call, Hub connection, YouTube credential, provider request, database query or deployment was performed. All fixtures are synthetic (no real channel, video, comment or moderator data).

## 8. No behaviour changed by this task

**No production behaviour was changed by this task.** Only `docs/audit/M24-06-sentinel-moderation-review.md`, `apps/sentinel/test/moderation-review-contract.ts` and `apps/sentinel/test/moderation-review-contract.test.ts` were created. No existing source, package manifest, config, TODO entry or unrelated document was edited, and neither test-only module is imported by `apps/sentinel/src`.

## 9. Limitations

- **Not wired into the package test script.** `apps/sentinel/package.json:20` enumerates three test files; the new test runs only through the focused command and `test/tsconfig.json` typecheck. Per task constraints the manifest was not edited; the integrator must add `test/moderation-review-contract.test.ts` to the script (or adopt a test glob) before package-test coverage includes it.
- The contract proves a **design policy**, not a runtime guard. It cannot prove production denial because production has no moderation/appeal code to guard.
- No YouTube or Hub endpoint was called; the review relies on static source and previously existing package tests.
- The review does not establish platform terms compliance for the Playwright/OpenClaw scraping paths (M24-01 R6 remains open) and does not grant rights.
- Reviewer is unassigned; AI review is not human approval. CI at the integration SHA has not run for these files.
- Line numbers are baseline-relative; the shared working tree is dirty in unrelated paths (Sentinel sources themselves were untouched).

## 10. Rollback

Delete the three files listed in §8. No source, schema, manifest or runtime state is affected. The focused test count returns to the package's existing 20 tests.
