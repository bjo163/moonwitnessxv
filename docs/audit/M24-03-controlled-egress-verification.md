# M24-03 — Controlled outbound egress: closure verification

**Task:** M24-03 — "Design controlled outbound egress, quotas, retry and caching".
**Acceptance under verification:** "No uncontrolled alert bot or external fetch".
**State:** design + test-only policy contract verified by the integrator; runtime enforcement is explicitly **not** claimed and remains M24-04. TODO checkbox closed only for the design/contract scope the leaf delivers.
**Baseline:** `18cca2f78a567774b407c33483e75d5619390b11` (`dev`). Artifact commit under review: `b418dd9` (`docs(m24): specify controlled egress policy`).

## What the artifact contains

- [docs/design/M24-03-controlled-egress.md](../design/M24-03-controlled-egress.md) — provider-neutral policy: three default-deny capability classes (`INTERNAL_SERVICE`, `READ_ONLY_PROVIDER`, `ALERT_SINK`), exact origin/path allowlists, HTTPS-only external egress, SSRF/DNS-rebinding rules, budgets, bounded retries for idempotent GET/HEAD only, circuit breaking without fallback provider, cache rules that never turn a missing source time into a live observation, and notification-only alerts with dedupe and a kill switch.
- `apps/sentinel/test/egress-policy-contract.ts` (101 lines) — pure, zero-import decision model.
- `apps/sentinel/test/egress-policy-contract.test.ts` (90 lines) — 8 example-based cases.
- `apps/sentinel/package.json:20` — the contract test is wired into the package `test` script, so it runs in package verification.

The model is test-only: no production file imports it, no endpoint, flag or runtime path changed.

## Positive evidence

Focused run, working directory `apps/sentinel`, exit 0:

```
pnpm exec tsx --test test/egress-policy-contract.test.ts
✔ permits a rights-cleared read-only provider request at an allowlisted public origin
✔ permits a separately configured exact internal service origin
✔ denies requests when egress or capability is disabled or not recognized
✔ denies unknown rights, unapproved origins, unsafe URL parts, and redirects
✔ denies private, loopback, link-local, and metadata destinations for external classes
✔ denies non-GET provider methods, exhausted budgets, and provider fallback
✔ permits one approved notification but suppresses duplicate or retried alerts
✔ rejects URL fragments and invalid URLs before any network operation
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms 100.5767
```

Every refusal path asserts a stable reason code (`EGRESS_DISABLED`, `CAPABILITY_DISABLED`, `UNKNOWN_CAPABILITY`, `RIGHTS_NOT_CLEARED`, `ORIGIN_NOT_ALLOWED`, `PATH_NOT_ALLOWED`, `HTTPS_REQUIRED`, `URL_CREDENTIALS_OR_FRAGMENT`, `INVALID_URL`, `NON_PUBLIC_ADDRESS`, `REDIRECT_DENIED`, `PROVIDER_METHOD_NOT_READ_ONLY`, `BUDGET_EXHAUSTED`, `FALLBACK_FORBIDDEN`, `RETRY_LIMIT_EXCEEDED`, `ALERT_DUPLICATE`, `ALERT_RETRY_FORBIDDEN`, `ALERT_CONTENT_NOT_APPROVED`, `PUNITIVE_ALERT_FORBIDDEN`). No socket, DNS lookup or network call exists in the model or the test.

Package-level run from the repository root, exit 0:

```
pnpm --filter @moonwitness/sentinel test
ℹ tests 20
ℹ pass 20
ℹ fail 0
```

Typecheck (`pnpm --filter @moonwitness/sentinel typecheck`, `tsc --noEmit` plus `tsc --noEmit -p test/tsconfig.json`): exit 0, no diagnostics.

## Negative evidence

The eight cases above are the negative matrix required by the acceptance: no alert bot can POST without an explicitly approved sink, content approval, a dedupe key and a non-punitive action; no provider fetch can open without enabled egress, cleared rights, exact allowlisted origin/path, HTTPS, a public resolved address, an empty redirect list and available budget; a fallback provider or a retry beyond two attempts is refused. URL credentials, fragments, IP-literal/private/metadata destinations and malformed URLs are refused before any transport step. The failure mode is fail-closed with a reason code and no payload echo: the model returns `{ allowed, reason }` only, and never includes the URL, headers or bodies in the result.

## What is deliberately not proven

Observed production gaps remain, as the design states: the AI-Gateway `agent` driver does not consult `EGRESS_ENABLED` (`apps/sentinel/src/agent.ts`), webhook dispatch has no shared quota, dedupe or review gate (`apps/sentinel/src/webhooks.ts`), and source/worker endpoint URLs reach `fetch` without a common destination policy (`apps/sentinel/src/index.ts`). M24-03 is a design and contract task: it forbids those paths by policy, and **M24-04** must implement the guard inside every real `fetch` path with tests that spy on `fetch` to prove no request is issued on denial. No rights, terms, consent or D08 publication approval is granted here, and no live provider, credential, alert sink or deployment was exercised.

## Commands run by the integrator

| Command (working directory) | Observed result |
|---|---|
| `pnpm exec tsx --test test/egress-policy-contract.test.ts` (`apps/sentinel`) | 8 tests, 8 pass, 0 fail, exit 0 (verbatim above) |
| `pnpm --filter @moonwitness/sentinel test` (repo root) | 20 tests, 20 pass, 0 fail, exit 0 |
| `pnpm --filter @moonwitness/sentinel typecheck` (repo root) | exit 0, no diagnostics |

## Rollback

Delete `docs/design/M24-03-controlled-egress.md`, `apps/sentinel/test/egress-policy-contract.ts`, `apps/sentinel/test/egress-policy-contract.test.ts`, remove the file from `apps/sentinel/package.json:20`, and delete this audit. No runtime path depends on them.

## Limitations

- Policy model only; production egress remains unguarded until M24-04, and the artifacts are not imported by runtime code.
- Deterministic example-based tests over small synthetic inputs; no fuzzing, DNS-resolution test or proxy behaviour was exercised.
- Baseline `main` cited by the design is `cb223749d18a1396e0f9e6b8edc4aa03ec4f7092`; runtime flags, provider terms and rights remain unapproved.
- No reviewer approval is implied; the integrator accepted the design/contract scope only.
