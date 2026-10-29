# M24-03 — Controlled outbound egress policy

**Status: provider-neutral design; production egress remains unapproved and must stay disabled.** This design introduces no provider, credentials, network calls, or runtime enablement. It is the required policy contract for future M24-04 adapter work.

## Scope and observed baseline

The existing ARSY/MoonQL Monitor remains the source/task owner; Sentinel is a worker. M03-07's egress controls cover ARSY/Radio fetches and do not prove Sentinel is protected. Current Sentinel behavior has independent outbound paths: source drivers, AI Gateway `agent` requests, and Discord/Telegram webhooks. `EGRESS_ENABLED` does not guard the `agent` driver; source and worker endpoint URLs are passed to `fetch` without a common destination policy. Webhook dispatch sends POST requests without a shared quota, deduplication, or review gate. RSS parsing can substitute current time when source time is absent, so cache/freshness must not treat that fallback as source observation time.

This is a design contract only. No existing endpoint or outbound path is changed by M24-03. The policy-test model is kept under Sentinel tests and is not imported by production code.

## Capability classes and default-deny rules

Every outbound request must declare exactly one capability class. A single `EGRESS_ENABLED=true` switch is insufficient authority.

| Class | Purpose | Default | Required authorization |
| --- | --- | --- | --- |
| `INTERNAL_SERVICE` | Fixed ARSY/AI Gateway service URL | deny | Explicit configured service origin, service identity, request timeout and route allowlist. Never derive an internal URL from provider input. |
| `READ_ONLY_PROVIDER` | Future public-source GET/HEAD adapter | deny | M24-04 feature flag, exact scheme/host/port allowlist, active source rights snapshot, permitted terms/attribution, and per-source budget. |
| `ALERT_SINK` | Optional operator-approved webhook | deny | Separate alert flag, exact sink allowlist, approved destination and content policy, rate/deduplication key, and no unresolved rights/privacy restriction. |

Unknown classes, missing configuration, unknown/expired rights, egress flag off, malformed URLs, or a disabled capability must reject before opening a socket. No automatic host discovery, provider fallback, or “free tier” model/provider fallback is permitted.

## Destination and SSRF policy

1. Parse and canonicalize URL once. Reject URL credentials, fragments, unsupported schemes, unexpected ports, IP-literal hosts unless explicitly approved internal service addresses, ambiguous encodings, and hostnames outside the class-specific exact allowlist.
2. Provider and alert destinations require HTTPS. Internal service requests may use HTTP only for an explicitly configured fixed in-network origin; that exception cannot be reached through provider-controlled input.
3. Resolve DNS at connection time and reject loopback, private, link-local, shared-address, multicast, unspecified, reserved, and metadata-service IPv4/IPv6 ranges. Prevent DNS rebinding by connecting to the validated resolved address while preserving TLS hostname verification. Revalidate after every DNS lookup and before connection.
4. Disable redirects by default. If a future provider explicitly needs redirects, cap at three hops and re-run the full scheme/host/port/DNS/class policy at every hop; never forward authorization headers across origins.
5. Do not inherit ambient proxy settings or follow browser/system proxy routes unless an operator has configured an approved egress proxy with equivalent destination enforcement.

## Budgets, retries, caching and alert controls

- Apply global, per-class, per-host and per-source token/concurrency budgets before each request. Set bounded request/response bytes, connect/total timeout, and response parsing limits. Exceeding a budget fails closed with a stable reason code.
- Retry only idempotent GET/HEAD for transient transport errors or 429/502/503/504, at most two retries with capped exponential backoff and jitter; honor `Retry-After` only within a configured ceiling. Never retry an alert POST automatically. Any future POST retry requires sink-supported idempotency and a separate decision.
- Circuit-break a failing destination after a bounded error threshold; use half-open probes within quota. A circuit break must not trigger a different provider or a fallback data source.
- Cache only successful, bounded, non-sensitive provider responses after rights checks. Cache key includes normalized approved origin/path/query and representation headers; exclude credentials. Honor provider validators (`ETag`/`Last-Modified`) and a source-specific maximum TTL. No stale-while-revalidate or stale-as-live behavior. If source observation time is absent, it stays unknown even when cache `fetchedAt` exists.
- Alerts are disabled by default and are notifications only, never moderation, reporting, takedown or other punitive actions. Require an approved sink and a dedupe key (`sourceRef`, external record ID, revision). Enforce per-sink and global rate limits, bounded payloads, safe escaping, redaction, and an operator kill switch. Unknown rights, private/minor material, AI-only classification, or unsupported theological claims suppress dispatch. No automatic retry for webhook POST.
- Logs/events use stable error codes and bounded counters. Never log tokens, webhook URLs, query strings with secrets, response bodies, private source content, or full untrusted redirect chains.

## Required request decision order

`class → feature flag → rights/consent → URL allowlist → DNS/IP check → quota → timeout/size budget → request → bounded parse → cache policy → projection/alert policy`.

Every step is deny-by-default. A successful request proves transport only; it does not prove source accuracy, freshness, consent, rights clearance, or public-release approval. D08/publication and M24-04's provider-specific acceptance remain separate gates.

## Positive and negative contract evidence

The test-only policy model in `apps/sentinel/test/egress-policy-contract.ts` and cases in `apps/sentinel/test/egress-policy-contract.test.ts` exercise the rules without opening sockets:

- Positive: an explicitly enabled, rights-cleared, allowlisted HTTPS provider GET with a public resolved address and available budget is permitted; a separately configured internal service may be permitted only under its exact fixed origin; an explicitly approved alert sink may send a single deduplicated notification.
- Negative: egress disabled; unknown class; missing/unknown/expired rights; unapproved host or port; URL credentials; private/loopback/link-local/metadata address; redirect to a different or private host; exceeded budget; retry of a non-idempotent alert POST; absent alert enablement or sink allowlist; duplicate alert key; and attempted fallback provider are denied or suppressed.
- This evidence tests the policy model, not the existing network code. M24-04 must implement the same guard in every actual fetch path and add tests that spy on `fetch` to prove no request is issued on denial.

## Rollout, rollback and next task

Keep all live provider and webhook flags off until M24-04 implements this design and source terms/rights are approved. Rollback of this design removes this document and test-only model/cases; it does not affect production because the model is not wired to runtime. **Next eligible:** M24-04, one read-only provider adapter behind the policy and explicit source gate. M24-06 remains independent and open; its moderation/appeal authority requires separate review.

## Evidence record

- Baseline `main`: `cb223749d18a1396e0f9e6b8edc4aa03ec4f7092`.
- Source inspection: `apps/sentinel/src/index.ts`, driver implementations and `apps/sentinel/src/webhooks.ts`; M03-07 reviewed as ARSY/Radio-scoped evidence only.
- Runtime action: none; no external request or provider credential used.
- Exact result SHA and CI run are added after integration; reviewer is AI technical review and does not imply rights/privacy approval.
