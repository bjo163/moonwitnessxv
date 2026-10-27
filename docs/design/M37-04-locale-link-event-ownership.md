# M37-04 — Locale-preserving links and event ownership

**Design specification · source SHA `ba02b8a3a28a0ed7dbc47d9ae4cfbb52461ce237` · no shared event bus or navigation runtime.** The task packet says “event owner” without defining an event taxonomy. This bounded interpretation assigns navigation/locale events to the application that creates them and keeps locale in normal route context; it does not invent cross-app event infrastructure.

## Locale context across links

1. **Explicit route locale is authoritative.** For routes with a supported `/id` or `/en` prefix, internal links preserve the current locale. A supported explicit target locale intentionally overrides the current one. This follows ADR-0005; locale never changes identity, authorization, source language, or tenant/resource scope.
2. **Use same-app relative routes.** A link builder accepts a trusted route path plus already-validated query/hash values; it emits an internal relative path. It rejects external URLs, protocol-relative `//`, backslash authority forms, CR/LF, and normalized traversal. Never pass session tokens, auth codes, user IDs, tenant claims, or private event payloads through a link.
3. **Cross-app navigation uses registered destinations.** Each owner declares app ID, allowed origin(s), supported locales, and permitted route templates in a reviewed registry/config. Construct only a registered URL and an allow-listed path/query schema. Do not accept a caller-supplied host or open redirect target. If a destination has no locale-aware UI, omit locale rather than asserting support; destination negotiation follows its own ADR-0005 implementation.
4. **Fallback is deliberate.** Unsupported route locale follows that app's not-found behavior; it is not silently switched to another locale. A locale-preserving link may fall back only when the destination explicitly declares that it does not support the locale, and must not rewrite source passage language.
5. **Preferences are not identity.** A persisted locale cookie or account preference influences presentation only. Do not share parent-domain cookies merely to carry `id`/`en` between apps. In-app route prefixes remain the portable, inspectable context.
6. **Preserve safe query state only.** Keep allow-listed non-sensitive state required for the same page; drop credentials, raw search of private/witness material, unrecognized parameters, and cross-app tracking payloads. Fragments remain local UI state and must not contain secrets.

## Event ownership

- **Navigation and locale-switch events:** the source app's router/UI owns click, history and locale-change events; it updates its own route and preference. A cross-app handoff is an ordinary verified link, not a privileged command or an implicit authentication transfer.
- **Identity/session/security events:** ARSY/D00 owns canonical session validity, expiry, revocation and identity state. Consumers may observe a typed response and clear their own local presentation state, but may not mint a competing session or claim global logout without central confirmation.
- **Domain events:** the service that owns the data and lifecycle publishes the canonical event: ARSY owns D00 identity/session and Hub operational lifecycle; SKYLINK owns D18 messaging events; ECHOLOG owns D19 object-storage events under their accepted contracts. Headquarters separately owns human decision and audit records. Frontends may project or subscribe through approved contracts; they do not re-publish a second canonical event.
- **Human decision events:** Headquarters/100CENTER owns the user decision and audited decision record. ORBIT or another frontend can submit a proposal/handoff but cannot synthesize approval, alter the actor, or auto-publish.
- **UI-local events:** transient drawer, tab, toast and focus events stay within the owning UI unless a documented consumer exists. Do not add a global browser event bus for one consumer; event payloads must contain no bearer token or private content by default.
- **Event envelope (future contract):** use stable event type/version, owning service, event ID, occurred-at timestamp, correlation ID, and a typed, minimal payload. Authorization travels in the authenticated request/stream channel, never in an event body. Delivery, replay, retention and ordering must be specified by the service owner; the consumer treats payload as untrusted and deduplicates where the contract requires it.

## Positive and negative acceptance matrix

| Case | Required result |
|---|---|
| `/id/...` current page links to another supported route | Result remains `/id/...` with only allow-listed local state |
| Explicit user switch from `id` to `en` | Link targets the corresponding safe route; preference and route update according to the app contract |
| Cross-app destination registered with matching locale support | Navigate to the registered origin/path and preserve only the supported locale |
| Unsupported locale or destination without declared support | Not-found or documented destination fallback; never claim locale support or alter source text |
| `//host`, backslash host, external scheme, CR/LF, traversal or encoded separator | Reject; no external navigation, credential leak or host derived from request headers |
| Unknown query, session token, private search term or tenant selector in handoff | Drop/reject; no PII, credential or scope crosses via URL |
| Duplicate/stale/malformed domain event | Consumer handles per owner contract, never upgrades to authoritative or approved state |
| Frontend emits a decision, identity, or service lifecycle event it does not own | Reject or keep it as an explicitly labelled local proposal; canonical owner remains authoritative |

## Current implementation evidence and limitations

At `ba02b8a3a28a0ed7dbc47d9ae4cfbb52461ce237`, inspected ADR-0005, `docs/architecture/I18N.md`, Dock `locale-context.mjs`, Dock middleware and locale switcher, HQ request-locale and session code, HQ ops event-stream client, `scripts/apps.registry.mjs`, and the accepted SKYLINK/ECHOLOG ownership documents. Dock currently has a centralized local link builder that preserves `/id` and `/en`, validates locale, and constrains path/search/hash formats; HQ resolves locale server-side but the repo does not provide a shared cross-app link registry. Event types are service/app-owned; the reviewed sources do not establish a common event bus or universal envelope.

Focused check: `pnpm --filter @moonwitness/dock exec node --input-type=module -e "import { localizedDockHref } from './src/lib/locale-context.mjs'; console.log(localizedDockHref('/id/reader','?page=2','#text','id')); console.log(localizedDockHref('/id/reader','','','en')); console.log(localizedDockHref('//evil.example','','','id'))"` printed `/id/reader?page=2#text`, `/en/reader`, and `/id`. This is a bounded positive/negative check of Dock's existing helper only; it does not test every unsafe path encoding or cross-app origin behavior.

Positive evidence is source inspection of Dock route-localization and separate HQ locale resolution. Negative evidence: no cross-app event bus/registry or proof of locale-preserving behavior across all apps was found; no production cross-app links were exercised. This document is not a claim that the proposed URL validation covers every parser normalization case, that all apps have locale-switch UI, or that an event bus exists. Future implementation must add unit/browser tests for encoded traversal/authority, unsafe query filtering, origin allow-lists, history behavior, unknown/stale events, and no token/PII propagation at an exact SHA.

## Rollback

One additive specification file; rollback by deleting this file only after checking references. No router, cookie, app registry, event stream, or domain event source is changed.
