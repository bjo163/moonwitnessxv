# ADR-0005 — Shared locale contract

- **Status:** ACCEPTED — M05-09 decision; runtime implementation is not shipped.
- **Date:** 2026-10-27
- **Owner:** platform/i18n, with each application owner retaining its UI and API implementation.
- **Scope:** canonical `id`/`en` locale policy, runtime inclusion, and compatibility boundaries. Implementation and executable resolver/catalog tests remain M05-10/M05-11 and their application tasks.

## Context

The repository has six runnable applications, multiple human-facing web and local interfaces, source passages in multiple languages, and machine-facing HTTP/CLI contracts. A shared locale decision must not treat a translated source passage as translated application UI, duplicate a data owner, or make locale selection affect authorization or protocol identity.

The [M05-08 source inventory](../audit/M05-08-locale-inventory.md), reviewed at `4b229ec97ed6468dbe8b01fc79f29398e3b368b4`, found no shipped locale resolver, UI catalogs, locale cookie, or account locale preference. Dock and Headquarters are Next.js interfaces; Cockpit is a local Vite GUI; ARSY (currently `apps/radio`) serves an API, a browser launchpad, and the authenticated MoonQL Studio; AI Gateway and Sentinel are service/worker interfaces. The root operator CLI and SDK generator have separate owners. The preference order here is therefore a future shared contract, not a description of current behavior.

## Decision

### Canonical locales and catalog rules

1. UI v1 supports exactly the canonical language identifiers `id` and `en`. They are language identifiers, not country, timezone, currency, edition, or source-language identifiers. The deterministic default is `en`, matching the current English-only UI baseline; no location or IP lookup may select a locale.
2. Store and pass canonical locale values as `id` or `en`. For this product contract, a valid language range such as `id-ID` or `en-US` in `Accept-Language` may select its supported primary language; do not preserve the region subtag as a separate UI locale. Honor RFC 9110 quality values (including `q=0` as unacceptable); prefer the supported entry with the highest quality and preserve header order for ties. Ignore malformed and unsupported entries and ultimately fall back to `en`. A wildcard alone does not select a language. See [RFC 9110 §§12.4.2 and 12.5.4](https://www.rfc-editor.org/rfc/rfc9110.html#section-12.5.4).
3. Catalog keys are stable semantic identifiers, independent of displayed wording and language. Do not use translated text, user content, API identifiers, database fields, route names, or source-language labels as keys. User-visible values must be escaped in their rendering context.
4. Catalog messages may interpolate runtime values and use ICU MessageFormat for plural/select rules. Format numbers and dates through explicit `Intl` locale inputs under M05-12; timezone and currency remain separately specified data, never inferred from `id`/`en`.
5. English is the required fallback catalog. Missing-key parity is a verification failure under M05-13; runtime fallback to English is deterministic and must not expose a raw key as UI copy.

### Preference and negotiation order

For a UI runtime that supports the corresponding source, resolve in this order:

1. A supported, explicit locale in the current URL route.
2. The user's explicit, persisted locale selection.
3. An existing authenticated account locale preference, where that application already has one.
4. The supported, valid `Accept-Language` preference with the highest quality value; preserve header order for ties.
5. The English default.

An explicit supported route always wins. An unsupported locale route is not silently rewritten to another locale; it follows that application's not-found behavior. Invalid persisted values and invalid account values are ignored. Preference resolution is presentation state only and must not create an authentication session, change a role, or authorize a request.

### Runtime inclusion and owners

| Runtime | In scope | Locale selection boundary | Owner |
|---|---|---|---|
| Dock public Next.js UI | All human-facing UI, forms, accessibility names, metadata, and supported public pages. `/id` and `/en` are the localized route roots; `/` follows the shared preference order. | Route locale wins. Keep existing API, embed, asset, stream, and metadata paths outside locale rewrites. | M19-08–M19-19; source-script semantics M19-31; formatting M05-12. |
| Headquarters privileged Next.js UI | Login, navigation, admin screens, labels, validation, and safe user-facing errors. | Locale is presentation context only. Its selector/persistence and localized routing must preserve existing middleware, role checks, session cookies, BFF routes, and SSE paths. No public locale redirect may bypass auth. | M19-20–M19-24; shared resolution M05-11. |
| Cockpit local Vite GUI | Visible panels, menus, dialogs, confirmations, tooltips, help, and accessibility names. | Accessible in-GUI selector and local preference; no forced `/id` or `/en` URL. Do not reinterpret operating-system country as locale. | M19-25–M19-30; shared resolution M05-11. |
| ARSY browser launchpad and authenticated Studio | **Included.** Both render human-facing HTML (`apps/radio/src/lib/launchpad.ts` and `apps/radio/src/modules/studio/index.ts`). Localize their owned UI copy, including login labels and safe actionable messages. | Preserve `/` and the existing `/api/v1/studio` route. Use explicit supported locale when a route has one; otherwise persisted selection, existing account preference if available, validated `Accept-Language`, then `en`. Do not add a second account/session system. | M05-14, after M05-09 and M28-05. |
| ARSY HTTP API | Human-facing error messages and diagnostics only when the consumer presents them to a person. | A validated `Accept-Language` may select `id`/`en`; default `en`. Localize only safe application-owned message text. | M05-14. |
| AI Gateway HTTP API | Provider/model descriptions and validation messages only where a consuming UI presents them to a person. | Validated `Accept-Language` may select `id`/`en`; default `en`. Preserve the OpenAI-style response shape and stable IDs. Do not translate raw provider errors. | M05-15 decides the exact consumer-visible fields. |
| Sentinel worker/CLI | Human help or actionable operator diagnostics, if emitted by the command. | Command-specific selection is decided by M05-16; default `en`. | M05-16. |
| Shared `moon` CLI and SDK generator | Human help, status, and actionable errors. | CLI-specific locale selection is decided by M05-23 using the shared catalog after M05-10. | M05-23. |
| Shared MoonUI | Human-facing shared chrome and accessibility labels only. | Inherit the consuming UI's resolved locale. | M19-31–M19-35. |
| Future App Factory outputs | User-facing UI templates only; services and workers do not receive a decorative selector. | Generated runtime inherits the matching rule above. | M05-19–M05-21. |

No interactive TUI exists in the current six applications or shared CLI tools. A future TUI must be explicitly scoped by its owning task before receiving localized output.

### Invariants and acceptance vectors

- Keep API paths, status codes, existing envelope fields, auth outcomes, database/model/field IDs, provider/model IDs, command names/flags/exit codes, structured log fields, telemetry, and machine-readable output stable. The only API value eligible for translation is safe human message text; raw runtime/provider text remains unchanged and must not reveal secrets.
- A localized message must not be the only machine discriminator. If a surface has no stable discriminator for an error, its owner must preserve the message in English until a separately accepted API contract supplies one; M05-14/M05-15 must not invent a breaking field here.
- Cache behavior must respect the source of the selected locale: URL locales use distinct route keys; responses negotiated by `Accept-Language` vary on that header; responses personalized by a locale cookie/account are private and must not be served from a shared cache. Any session-specific console data must be private/no-store and retain its existing auth checks. Never log the full `Accept-Language` preference list as analytics or identity data.
- Source passages, translations, transliterations, language/script tags, direction, edition IDs, citation fingerprints, rights/consent state, and authoritative statements remain source data. UI locale never authorizes or substitutes a translation.
- Auth and privacy behavior, ARSY service ownership, source rights, accessibility semantics, and machine-consumed output remain unchanged by locale selection.

Positive policy vectors for M05-10/M05-11: `/id/...` with persisted `en` and header `en` resolves to `id`; absent URL with persisted `id` and header `en` resolves to `id`; `Accept-Language: id-ID,en;q=0.8` resolves to `id`; `en-US` resolves to `en`.

Negative policy vectors for M05-10/M05-11: invalid persisted `fr` plus unsupported `fr` header resolves to `en`; `id;q=0` cannot select `id`; `/fr/...` is not silently remapped; locale selection cannot alter auth/API contracts; Arabic source text with `lang="ar"` remains Arabic when UI locale is either `id` or `en`.

These are normative contract vectors, not claims of a shipped resolver or passing runtime locale tests. Executable coverage belongs to M05-10/M05-11 and per-app acceptance tasks.

## Consequences

- ADR-0005 replaces the proposed global locale boundary. M05-10 may choose the smallest viable home for the one registry/catalog after inspecting existing package reuse; it must not change these semantics or create per-app resolvers.
- M05-14 now owns the human-facing launchpad and Studio surfaces in addition to eligible ARSY API messages. Their route, auth, and API contracts remain stable.
- M05-15 and M05-16 retain consumer classification and machine-output boundaries; M05-23 owns shared developer/operator CLI output. No task may duplicate these owners.
- M19 tasks implement user-facing app behavior; this decision does not claim any bilingual app is shipped or verified.
- Rollback of this decision requires a superseding ADR and coordinated TODO owner update before implementation; no code rollback is implied because this ADR changes no runtime code.
