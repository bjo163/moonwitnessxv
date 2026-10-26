# M19-08 — Dock route and public-content locale audit

**Audit baseline:** `c1f828b69c81e6ab039a9606597f658d3a38a1f9`
**Audit date:** 2026-10-27 (Asia/Jakarta)
**Scope:** `apps/dock/src/app`, `apps/dock/src/ui/components`, routing/protection and locale-sensitive source projections. This is an inventory of current code, not a claim that Dock is localized.

## Findings

README says Dock does not yet demonstrate end-to-end bilingual content. ADR-0005 is accepted as a future contract and explicitly says its resolver/catalog tests are not shipped. The route prefix contract `/id` and `/en` is prospective. In current code, the route tree is unprefixed, root is `/`, the document layout hardcodes `<html lang="en">`, and the shared header/footer copy is English. No locale selector, persisted locale resolver, language negotiation, `hreflang`, or locale-aware metadata was found in the inspected Dock app. No Dock auth/session gate was found in `src/middleware.ts`, root layout, or public shell; this is a route-level code audit and does not establish deployment access policy.

### App Router inventory and exposure

All listed `page.tsx` routes use the public root layout and no route-level authentication guard was found during inspection. “Public” below means no app-level protection was found, not that a production deployment was probed.

| Current path | Kind / status |
|---|---|
| `/` | Public page; homepage |
| `/constellation` | Public page |
| `/constellation/relations/[relationCode]` | Public page |
| `/denpa` | Public page |
| `/embed/[id]` | Public page; embed framing policy applies |
| `/figures` | Public page |
| `/figures/[figureCode]` | Public page |
| `/missions` | Public page |
| `/patches` | Public page |
| `/prisms` | Public page |
| `/reader` | Public page; exact source/edition and rights states |
| `/reader/compare` | Public page; current page contains a static parallel-edition fixture |
| `/research` | Public page; public projection sourced through query client |
| `/schedule` | Public page |
| `/stations` | Public page |
| `/stations/[id]` | Public page |
| `/studio` | Public page by observed route structure; inspect before any future auth assumptions |
| `/terms` | Public page; read-only projection of Hub vocabulary data |
| `/terms/[stableId]` | Public page |
| `/timeline` | Public page |
| `/api/denpa/transmit` | API route; machine/request path, preserve outside locale routing |
| `/api/listen` | API route; stream/listen path, preserve outside locale routing |
| `/api/now-playing` | API route; preserve outside locale routing |
| `/api/on-air` | API route; preserve outside locale routing |
| `/api/stations/[id]/live-meta` | API route; preserve outside locale routing |
| `/manifest.webmanifest` | Framework metadata route from `app/manifest.ts`; matcher explicitly excludes it |

This is the actual `src/app` route inventory at baseline. The root `SiteLayout` wraps every page and the shared shell links to existing unprefixed URLs. `middleware.ts` sets response security headers and embed CSP; it does not rewrite locales or authenticate requests. It excludes `_next`, favicon, icon and manifest from its matcher. The `embedOrigins` allowlist controls framing only; it is not page authorization.

### Existing legacy URL behavior

Current URLs are the unprefixed paths in the table above. There is no observed redirect or alias between `/` and `/id` or `/en`, no locale-prefixed route segment, and no unsupported-locale handler. Do not describe `/id` or `/en` as existing legacy routes: ADR-0005 calls them future Dock localized roots. The current root stays `/` and the current navigation emits unprefixed links. Future M19-09 needs to specify how legacy `/...` URLs behave when locale roots are added, while retaining API, embed, asset, stream and metadata paths as the accepted contract requires.

### UI language versus source content and rights

Locale scope must not be treated as corpus translation. The Reader data contract keeps source `originalLanguage`, edition, rights status, Arabic source text, and translations as distinct fields; the Reader UI displays an Arabic `lang="ar"`, `dir="rtl"` source and only renders translation text when its `blocked` state permits it. Terms carries per-form `languageCode`, `scriptCode`, and direction, with independently reviewed senses/sources. Existing Reader/Terms checks verify Arabic, Hebrew and Greek labels/direction and check that blocked English translation text is absent. Those checks support preserving source language metadata and rights gates during UI localization; they do not prove all displayed copy is localized or establish rights for the corpus as a whole.

The `reader/compare` page currently declares six sample rows and passes `rightsCleared: true` for each to citation creation. Treat these as current in-code fixture data, not a repository-wide rights audit or an approval to translate/reuse source material. Dynamic Reader content flows from Hub `/corpus/reader`, whose interface says returned text is already rights-filtered. Terms likewise reads the Hub projection; Dock is not the canonical vocabulary owner. UI locale changes must not translate, rewrite, infer, or replace source text, edition identifiers, provenance, rights status, script/direction tags, or authoritative statements.

## Focused evidence

Commands were run from `apps/dock` using the existing UI drill scripts:

```text
node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-reader-ui.tsx
Reader UI drill: 28 checks passed.

node ../radio/node_modules/tsx/dist/cli.mjs scripts/verify-terms-ui.tsx
Terms UI drill: 45 checks passed.
```

Positive evidence: Arabic source has `lang="ar"` and RTL; Indonesian translation has `lang="id"`; Arabic/Hebrew/Greek term forms retain their own language/script/direction; visible source/provenance and rights states are checked. Negative evidence: blocked translation has no text node, blocked Arabic has no Arabic text element, and ambiguous/absent Reader states expose no unapproved or invented passage. These are focused content/UI regression drills, not locale-route acceptance tests.

## Gaps, rollback, and next work

M19-08's inventory and source-boundary review are complete. The positive and negative Reader/Terms drills exercise the public content and rights boundary and show that source languages are not conflated with UI locale. There are no locale-route, unsupported-route, or `/id`/`/en` mapping tests because this audit baseline has no locale routes; route behavior belongs to M19-09. No runtime was changed, so no runtime rollback was needed; removing this audit artifact is the rollback.

Next eligible route implementation is **M19-09**, subject to its listed prerequisites M05-11 and this audit being accepted. M19-10/11 content work follows route support and must preserve the source-language/right boundaries above. M19-18 (nested `SiteLayout` removal) also depends on M19-08 and can proceed independently after this audit is accepted.

**Result source SHA:** `e73e156bf4616131152ff865b3f6f67658a92d77`.
**Files changed:** `docs/audit/M19-08-dock-locale-scope.md` only.
**Limitations:** no production/browser request was made; route protection assessment is limited to inspected application code; no locale-routing tests exist among the focused scripts run.
