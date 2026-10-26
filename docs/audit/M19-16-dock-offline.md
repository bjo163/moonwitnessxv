# M19-16 — Dock Hub-offline landing resilience

- **Task:** M19-16, decouple informative landing from live Hub availability.
- **Baseline branch/SHA:** `codex/m05-08-locale-audit-387f784` / `107662d570aa2e17c395abd0053cf221259d1090`.
- **Prerequisites:** M19-09, M19-10, M19-11, M19-12.
- **Worker:** `teamwork_preview_worker_m1`.
- **Claimed/actual paths:** `apps/dock/src/app/page.tsx`, `apps/dock/src/data/queries/program.ts`, `apps/dock/test/home-offline.test.mjs`, this report.
- **Result SHA/reviewer:** pending integrator commit and review.

## Architecture and Fallback Mechanism

Dock operates as an independent Next.js App Router application communicating with the Fastify Radio Hub solely via HTTP (`createServerSdk({ env: { RADIO_API_URL } })`). Dock holds no direct database connection or PostgreSQL credentials.

When the Hub backend is offline, unreachable, or responding with server errors:
1. **Network Error Classification (`apps/dock/src/data/queries/program.ts`):**
   `isHubUnavailable(error)` inspects rejected queries for `MoonApiError` with status >= 500, or Node `TypeError` fetch failures with system error codes `ECONNREFUSED`, `ECONNRESET`, `EHOSTUNREACH`, `ENETUNREACH`, and `ETIMEDOUT`.
2. **Graceful Query Interception:**
   `withHubFallback(promise, fallback)` catches errors classified by `isHubUnavailable` and resolves `{ available: false, value: fallback }` without throwing unhandled exceptions.
3. **Payload Availability Aggregation:**
   In `homePayload()`, all 8 query results (`nowPlaying`, `stationCatalog`, `topStations`, `perCountry`, `perGenre`, `weeklySchedule`, `uiSettings`, `monitorSignalFeed`) are evaluated. If any query was unavailable, `payload.liveDataAvailable` is set to `false`.
4. **Resilient SSR Presentation (`apps/dock/src/app/page.tsx`):**
   `HomePage` evaluates `!payload.liveDataAvailable` and renders `<OfflineLanding copy={copy} />` with HTTP 200 OK.
   - Shows curated hero elements and approved mission statements (`copy.approvedMission`) in the requested language (`/id` or `/en`).
   - Renders an explicit, truthful status notice (`copy.liveDataUnavailable`: `"Data stasiun dan jadwal sementara tidak tersedia"` / `"Live station and schedule data is temporarily unavailable"`).
   - Completely omits live count and schedule components, preventing deceptive "0 stations in catalog" or broken widget displays.

## Evidence

- `pnpm --filter @moonwitness/dock exec node --experimental-strip-types --test test/home-offline.test.mjs`:
  - Exit 0; 1 passed, 0 failed.
  - Spawns live Next dev server on loopback with `RADIO_API_URL: 'http://127.0.0.1:65535/api/v1'` (unreachable port).
  - Asserts `GET /id` returns HTTP 200 with `"Partisipasi bersifat sukarela"` and `"Data stasiun dan jadwal sementara tidak tersedia"`.
  - Asserts `GET /en` returns HTTP 200 with `"Participation is voluntary"` and `"Live station and schedule data is temporarily unavailable"`.
  - Asserts negative check against `/STATIONS IN CATALOG|STASIUN DALAM KATALOG/`.
  - Asserts `GET /?from=locale-probe` negotiates 307 redirect to `/id?from=locale-probe`.
  - Asserts `GET /fr` fails closed with HTTP 404.
- `pnpm --filter @moonwitness/dock test`:
  - Exit 0; 24 passed, 0 failed, duration ~2.18s across all 5 test files (`home-offline.test.mjs`, `landing-copy-english.test.mjs`, `landing-copy-required-keys.test.mjs`, `landing-copy.test.mjs`, `locale-routes.test.mjs`).
- `pnpm --filter @moonwitness/dock typecheck`:
  - Exit 0; clean TypeScript check (`tsc --noEmit`).
- `pnpm --filter @moonwitness/dock build`:
  - Exit 0; Next.js 16.4.3 Turbopack compiled 27 pages cleanly.

## Safety, Rollback, and Boundaries

- Decoupling adds zero runtime dependencies and does not store credentials.
- Rollback reverts `apps/dock/src/app/page.tsx`, `apps/dock/src/data/queries/program.ts`, and `apps/dock/test/home-offline.test.mjs`.
- No deployment is claimed; verification was executed locally on Windows with Node 24 and pnpm 10.33.4.
