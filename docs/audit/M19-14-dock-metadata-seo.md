# M19-14 — Locale-Aware Dock Metadata & SEO Alternates

- **Task:** M19-14, implement locale-aware Dock metadata and SEO alternates.
- **Worker:** Worker M19-14 (`teamwork_preview_worker`).
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisites:** M19-09, M19-11 checked in TODO.
- **Claimed/actual paths:**
  - `apps/dock/src/lib/metadata.ts`
  - `apps/dock/src/app/layout.tsx`
  - `apps/dock/src/app/sitemap.ts`
  - `apps/dock/src/app/manifest.ts`
  - `apps/dock/test/metadata.test.mjs`
  - This report.
- **Result SHA/reviewer:** Pending integrator commit and review.

---

## Behavior and SEO Architecture

Prior to M19-14, `apps/dock/src/app/layout.tsx` exported static metadata hardcoded in English, rendered `<html lang="en">` statically, lacked canonical URLs and alternate hreflang tags, lacked dynamic OpenGraph locale tagging, lacked `/sitemap.xml`, and the web app manifest lacked a `lang` property.

### Architecture & Grounding
1. **Dynamic Metadata Resolution (`apps/dock/src/lib/metadata.ts`):**
   - Implemented `getDockMetadata(locale, routePath)` and `getDockBaseUrl()`.
   - Base URL is strictly grounded in `FRONTEND_URLS.dock` (`http://localhost:3001` or env override via `DOCK_PUBLIC_URL` / `NEXT_PUBLIC_SITE_URL`), preventing fictitious or external domains.
   - Computes dynamic title and description per locale from `dockMetadataCopy`.
   - Generates self-referencing canonical URL and symmetrical language alternates:
     - `alternates.canonical`: Exact active localized URL (e.g., `http://localhost:3001/id/stations`).
     - `alternates.languages`: Reciprocal mapping for `id`, `en`, and `x-default` (pointing to `en`).
     - Preserves subroutes and search/query parameters.
   - Generates OpenGraph metadata with `locale: 'id_ID'` / `'en_US'` and reciprocal `alternateLocale`.
   - Implements fail-safe fallbacks: invalid or missing locales fall back to default English metadata without throwing.
2. **Root Layout Dynamic Binding (`apps/dock/src/app/layout.tsx`):**
   - Replaced static `export const metadata` with `export async function generateMetadata(): Promise<Metadata>`.
   - Reads trusted forwarded headers (`x-mw-locale` / `DOCK_LOCALE_HEADER` and `x-mw-route-path` / `DOCK_ROUTE_PATH_HEADER`) via `await headers()`.
   - Dynamically renders `<html lang={locale}>`.
3. **Sitemap Generation (`apps/dock/src/app/sitemap.ts`):**
   - Generates Next.js App Router `/sitemap.xml` covering all 15 public Dock routes (`''`, `stations`, `schedule`, `missions`, `reader`, `reader/compare`, `terms`, `figures`, `constellation`, `research`, `prisms`, `timeline`, `patches`, `denpa`, `studio`).
   - Pairs each route with `/id` and `/en` URLs, including reciprocal `alternate.languages` (`id`, `en`, `x-default`).
4. **Web App Manifest (`apps/dock/src/app/manifest.ts`):**
   - Standardized PWA manifest by adding `lang: 'en'`.

---

## Evidence

- `pnpm --filter @moonwitness/dock test`: Exit 0; 51 passed, 0 failed across all suites.
  - `✔ metadata helper resolves Indonesian locale title, description, and canonical URL`
  - `✔ metadata helper resolves English locale title, description, and canonical URL`
  - `✔ metadata preserves subroutes and query parameters across canonical and alternates`
  - `✔ metadata fails safe to English defaults when given invalid or missing locale`
  - `✔ base URL is strictly grounded in FRONTEND_URLS.dock without fictitious domains`
  - `✔ sitemap generates valid, bidirectional localized entries for all public routes`
  - `✔ manifest adheres to PWA standard and specifies lang en`
- `pnpm --filter @moonwitness/dock build`: Exit 0; Next.js 16.4.3 Turbopack compiled and emitted:
  - `○ /manifest.webmanifest`
  - `○ /sitemap.xml`
  - All dynamic and static routes generated without type or lint errors.

---

## Safety, Rollback, and Boundaries

- All URL generation relies strictly on `FRONTEND_URLS.dock` and project-standard env overrides; no third-party endpoints or invented hostnames are referenced.
- Rollback: Remove `apps/dock/src/lib/metadata.ts`, `apps/dock/src/app/sitemap.ts`, `apps/dock/test/metadata.test.mjs`, and revert `apps/dock/src/app/layout.tsx` and `apps/dock/src/app/manifest.ts`.
