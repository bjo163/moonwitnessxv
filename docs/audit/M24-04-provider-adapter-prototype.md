# M24-04 — Feature-flagged read-only provider adapter prototype: evidence

**Task:** M24-04 — "Prototype one feature-flagged read-only provider adapter" (P2/D4).
**Acceptance under verification:** "Fails safely when provider/terms/connection missing".
**State:** prototype guard only. Not wired into `apps/sentinel/src/index.ts`; no live provider, credential, rights approval, terms approval, deployment or real network call was exercised. The integrator must verify; AI review is not rights/privacy approval.

**Baseline `dev` HEAD:** `cea723cade43e3460e885c37802a1bcbdf080be5` (recorded before writing). The shared worktree already contained other sessions' modified/untracked files (including `TODO.md` and cockpit/web assets); this worker touched only the files listed below and never staged, committed, stashed, checked out, rebased or pushed. Prerequisite M24-03 is committed at `b418dd9`.

## Delivered files

| File | Change | Purpose |
|---|---|---|
| `apps/sentinel/src/provider-adapter.ts` | new, 356 lines | One-provider, feature-flagged, read-only GET adapter with injected config/deps/decision model. |
| `apps/sentinel/test/provider-adapter.test.ts` | new, 233 lines | 15 node:test cases with injected fake `fetchImpl` and `resolveHost`; per-denial call counters. |
| `apps/sentinel/package.json` | 1-line edit (`scripts.test`) | Adds the new test file to the package test run; nothing else changed. |
| `docs/audit/M24-04-provider-adapter-prototype.md` | new | This evidence record. |

## Decision-model import: observed blocker and resolution

`apps/sentinel/tsconfig.json` sets `rootDir: "./src"` and `include: ["src"]`. `apps/sentinel/test/tsconfig.json` extends the base config and references `../tsconfig.json`, so the test project consumes the referenced project's built declarations. A `src/` module importing `../test/egress-policy-contract.js` was tried first and failed typecheck verbatim:

```
src/provider-adapter.ts(2,38): error TS6059: File 'Z:/project/moonradio/apps/sentinel/test/egress-policy-contract.ts' is not under 'rootDir' 'Z:/project/moonradio/apps/sentinel/src'. 'rootDir' is expected to contain all source files.
src/provider-adapter.ts(2,38): error TS6307: File 'Z:/project/moonradio/apps/sentinel/test/egress-policy-contract.ts' is not listed within the file list of project 'Z:/project/moonradio/apps/sentinel/tsconfig.json'. Projects must list all files or use an 'include' pattern.
```

Copying the model is forbidden, so the decision function is part of caller-visible dependency injection instead: `deps.decideIntent` is typed as a structural `ProviderPolicyDecider` over the adapter's own `ProviderOutboundIntent` shape. The test injects the real `decideOutboundIntent` from `./egress-policy-contract.js`; production code never imports test code. If a caller omits `decideIntent`, the adapter returns `DECISION_MODEL_MISSING` before resolving DNS or fetching. Promoting the model from `test/` to `src/` is future work and is **not** done here.

## Request order and gates

Implemented order: feature flag -> terms approved -> rights cleared -> provider identity -> egress/capability policy (injected model, twice) -> URL allowlist (pre-DNS call) -> DNS/address check (second model call with resolved addresses) -> timeout/size budget -> exactly one `GET` (`redirect: 'manual'`) -> bounded body read -> JSON parse -> structural payload validation.

The model is called twice because `OutboundIntent.resolvedAddresses` must be non-empty and public: the first call uses the TEST-NET-3 placeholder `203.0.113.10` only to evaluate every non-DNS gate before a resolver call; the second call uses the real resolved addresses. All URL/allowlist denials therefore occur before DNS, and all denials occur before `fetchImpl`.

## Reason-code matrix (observed by the test assertions)

| Gate | Reason code | `fetchImpl` calls | `resolveHost` calls |
|---|---|---|---|
| Feature flag not `true` | `FEATURE_FLAG_DISABLED` | 0 | 0 |
| Terms not approved | `TERMS_NOT_APPROVED` | 0 | 0 |
| Rights `UNKNOWN` / `EXPIRED` | `RIGHTS_UNKNOWN` / `RIGHTS_EXPIRED` | 0 | 0 |
| Capability / global egress disabled | `CAPABILITY_DISABLED` / `EGRESS_DISABLED` | 0 | 0 |
| Origin, path, scheme, port, credentials, fragment, malformed URL | `ORIGIN_NOT_ALLOWED`, `PATH_NOT_ALLOWED`, `HTTPS_REQUIRED`, `URL_CREDENTIALS_OR_FRAGMENT`, `INVALID_URL` | 0 | 0 |
| Budget exhausted | `BUDGET_EXHAUSTED` | 0 | 0 |
| Second/fallback provider | `FALLBACK_PROVIDER_FORBIDDEN` | 0 | 0 |
| No decision function injected | `DECISION_MODEL_MISSING` | 0 | 0 |
| Private/loopback/link-local/metadata resolved address | `NON_PUBLIC_ADDRESS` | 0 | 1 (required to know the address) |
| Non-2xx / redirect surfaced as 3xx | `HTTP_STATUS_REJECTED` | 1 | 1 |
| Transport error / timeout | `TRANSPORT_FAILED` / `REQUEST_TIMEOUT` | 1 | 1 |
| Body over `maxResponseBytes` | `RESPONSE_TOO_LARGE` | 1 | 1 |
| Body not JSON | `RESPONSE_NOT_JSON` | 1 | 1 |
| Missing/invalid `observedAt` or malformed payload | `PAYLOAD_CONTRACT_INVALID` | 1 | 1 |
| Unknown decision-model reason string | `POLICY_DENIED` | 0 | 0 |

Failure results are exactly `{ ok: false, reason }`; the URL, request headers, response body and provider payload are never included (asserted by serializing a 500-with-marker response).

## Positive evidence

Command (working directory `apps/sentinel`), exit 0:

```
pnpm exec tsx --test --test-name-pattern="permits exactly one allowlisted GET" test/provider-adapter.test.ts
✔ permits exactly one allowlisted GET and returns payload provenance without wall-clock fallback (17.1589ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 123.1457
```

The case asserts: injected flag/terms/rights cleared; allowlisted `https://feed.example.test/v1/observations`; resolver returns `198.51.100.10`; exactly one fetch with `method: 'GET'`, `redirect: 'manual'`; parsed source, metadata and data; and `observedAt = 2026-02-03T04:05:06.000Z`, copied verbatim from the synthetic payload rather than any wall clock.

## Negative evidence

Command (working directory `apps/sentinel`), exit 0:

```
pnpm exec tsx --test --test-name-pattern="fails|refuses|maps" test/provider-adapter.test.ts
✔ fails without any network when the feature flag is off (1.3334ms)
✔ fails without any network when provider terms are not approved (0.1249ms)
✔ fails without any network on unknown or expired rights (0.106ms)
✔ fails without any network when capability or global egress is disabled (0.2482ms)
✔ refuses non-allowlisted origins and paths, non-HTTPS, ports, credentials, fragments and malformed URLs (0.3292ms)
✔ refuses private, loopback, link-local and metadata addresses after DNS but before fetch (0.542ms)
✔ fails without any network when the request budget is exhausted (0.1203ms)
✔ refuses a second or fallback provider before any network (0.1111ms)
✔ refuses a non-JSON body after exactly one GET (15.6674ms)
✔ refuses an oversized body after exactly one GET (0.7664ms)
✔ refuses a payload without a valid observedAt instead of substituting the wall clock (0.6287ms)
✔ refuses non-2xx responses after one GET without echoing the body (0.2559ms)
✔ maps transport and timeout failures to stable codes after one attempt (0.2118ms)
✔ fails closed before any network when the decision model is not injected (0.0951ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 131.0261
```

Every "without any network" case asserts `fetchImpl` was called zero times; the address case additionally asserts the resolver ran once. Non-JSON, oversized and non-2xx cases assert exactly one fetch and no retry.

## Package and static checks

Full package suite from the repository root, exit 0:

```
pnpm --filter @moonwitness/sentinel test
ℹ tests 44
ℹ suites 0
ℹ pass 44
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3399.4359
```

This is 22 pre-existing contract tests, 7 worker-log tests, and the 15 new adapter tests.

ESLint on both new files: `pnpm exec eslint apps/sentinel/src/provider-adapter.ts apps/sentinel/test/provider-adapter.test.ts` -> exit 0, no diagnostics.

Typecheck requires the referenced project to be built first (repo project-reference order; root `verify` runs `build` before checks). Observed:

```
pnpm --filter @moonwitness/sentinel build          # exit 0, emits dist/provider-adapter.d.ts
pnpm --filter @moonwitness/sentinel typecheck      # exit 0, no diagnostics
```

Without the build, the test project reports `TS6305: Output file 'apps/sentinel/dist/provider-adapter.d.ts' has not been built from source file ...` (plus derived `TS7006` implicit-any errors). This is the existing `test/tsconfig.json` project-reference behaviour for every test that imports `../src/*.js` (same pattern as `apps/arsy`), not adapter logic; acknowledged as a verification-order limitation below.

## Security, rights and privacy notes

- No `process.env`, secret, credential, token or authorization header in the module; config is injected by the caller and the flag defaults to disabled.
- No real network, resolver or provider in code or tests: `fetchImpl` and `resolveHost` are fakes; fixtures use reserved `example.test` hostnames and RFC 2606/5737 documentation addresses.
- HTTPS-only external, exact origin and path allowlists, `GET` only, `redirect: 'manual'` with any 3xx rejected, single attempt (no retry, no fallback provider), bounded timeout and response bytes, JSON-only bounded parse.
- Failures never echo the URL, headers, body or payload; logs are not added.
- `observedAt` is taken from the payload or the response is refused; no `Date.now()`/`new Date()` substitution.
- No rights, terms, consent or publication approval is granted or implied; the adapter is not imported by `src/index.ts`, drivers or webhooks.

## Rollback

Delete `apps/sentinel/src/provider-adapter.ts`, `apps/sentinel/test/provider-adapter.test.ts` and this audit; revert the single `scripts.test` line in `apps/sentinel/package.json`. Remove generated output with `rm -rf apps/sentinel/dist` (or the root clean script). No existing runtime path depends on these files; M24-03's design and policy model are unchanged.

## Limitations and what is not proven

- Guard prototype only: the M24-03 decision model remains test-only and is injected; nothing is wired into the production sentinel cycle, so existing unguarded fetch paths in `src/index.ts`, drivers, `agent` and `webhooks.ts` are unchanged.
- Address validation uses a separate injected resolver, then `fetch` resolves the hostname again; the validated address is not pinned at connect time, so DNS-rebinding-safe connection pinning remains future work. No proxy configuration is handled.
- No retry/backoff, cache, circuit breaker, HEAD support or per-host token bucket; the request budget counter is caller-owned (`requestsUsed` is not mutated) and only one provider is supported.
- Synthetic fixtures only: no live provider, credentials, terms acceptance, rights snapshot, source accuracy, freshness or public-release approval is proven. A successful transport proves transport only.
- `observedAt` validation is structural (RFC 3339 with zone); it cannot prove the provider did not copy publication time.
- Typecheck of the test project needs a prior package build (see above).

**Next eligible task:** M24-05 — "Build source-backed public World Monitor with stale flags" (prerequisite M24-04; acceptance "Not showing stale fixtures as live observations").
