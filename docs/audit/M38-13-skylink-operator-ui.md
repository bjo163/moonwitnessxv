# M38-13 — SKYLINK operator UI implementation audit

**Task:** M38-13 · **Baseline:** `a60c590ce6ccf937fe6a84dd868b55aec238bb52` · **Status:** implementation and local browser evidence present; integrated exact-SHA CI and final review remain pending.

## Scope clarification

The task packet enumerates the client, Vite configuration, UI consistency gate, and ESLint React Hooks block, but it omits `apps/skylink/package.json` and `apps/skylink/src/server.ts`. The manifest is required to declare the UI runtime/build toolchain and include the client in package build/typecheck; the service entry point must serve the Vite output for the packet's required running-service screenshot to be possible. These are the minimum additional paths. Fastify serves only `/`, plus allowlisted static MIME types under `/assets/*`, with an asset-root containment check. Existing API routes keep their existing handlers.

M38-13's packet requests delivery-attempt history, so a bounded read path was added to the existing SKYLINK owner. It requires the existing ARSY admin policy, validates a 1–100 limit (default 50), checks the conversation exists, and returns only attempt ID, message ID, attempt number, status, and timestamp. Provider message identifiers and free-text provider error summaries are excluded because they may contain external identifiers or sensitive content. No table, identity role, or data owner was added.

## Changed paths

- `apps/skylink/package.json`
- `apps/skylink/vite.config.mjs`
- `apps/skylink/src/server.ts`
- `apps/skylink/client/index.html`
- `apps/skylink/client/tsconfig.json`
- `apps/skylink/client/main.tsx`
- `apps/skylink/client/App.tsx`
- `apps/skylink/client/lib/api.ts`
- `apps/skylink/client/skylink-layout.css`
- `apps/skylink/test/operator-ui.test.ts`
- `apps/skylink/test/skylink.test.ts` (runtime dependency contract updated for the UI)
- `apps/skylink/src/modules/routes.ts` (bounded admin-only delivery-attempt projection)
- `packages/skylink-store/src/repositories.ts` (conversation-scoped, bounded read query)
- `apps/skylink/test/control-plane.test.ts` (authorization and sensitive-field projection coverage)
- `scripts/ui/skylink-operator-evidence.mjs` (repeatable synthetic browser/keyboard evidence capture)
- `scripts/check-ui-consistency.mjs`
- `packages/eslint-config/src/index.js`
- `pnpm-lock.yaml`
- `docs/audit/M38-13-skylink-operator-ui.md`

## Evidence

- `pnpm --filter @moonwitness/skylink build` — passed before and after the delivery-attempt API/UI addition; Vite built the client and TypeScript built the service.
- `pnpm --filter @moonwitness/skylink typecheck` — passed, including client and tests.
- `pnpm --filter @moonwitness/skylink test` — passed, 12/12. This includes checks for served UI, path traversal rejection, bearer-only auth with omitted cookies, and the existing API/auth behavior.
- `pnpm --filter @moonwitness/skylink test` — passed after adding delivery-attempt projection: 12 passed, 0 failed, 0 skipped. The run used the local PostgreSQL-backed control-plane integration and verified admin success, viewer/service-key denial, newest-first results, and omission of provider IDs and free-text error summaries.
- `pnpm ui:check` — passed, 137 files scanned, 0 violations.
- `pnpm exec eslint apps/skylink/client/App.tsx apps/skylink/client/lib/api.ts apps/skylink/client/main.tsx apps/skylink/src/server.ts apps/skylink/test/operator-ui.test.ts apps/skylink/test/skylink.test.ts scripts/check-ui-consistency.mjs packages/eslint-config/src/index.js` — passed.
- The local service was started with empty optional credentials and a loopback-only ARSY URL: `$env:HOST='127.0.0.1'; $env:PORT='13005'; $env:DATABASE_URL=''; $env:SKYLINK_ARSY_URL='http://127.0.0.1:1'; $env:SKYLINK_SERVICE_KEY=''; $env:SKYLINK_TELEGRAM_BOT_TOKEN=''; $env:SKYLINK_TELEGRAM_WEBHOOK_SECRET=''; pnpm --filter @moonwitness/skylink exec node --import tsx src/index.ts` — service reported listening at `http://127.0.0.1:13005`.
- `pnpm exec node scripts/ui/skylink-operator-evidence.mjs` — passed; synthetic fixture, 1440×1000 screenshot, delivery attempt visible, keyboard focus confirmed, Enter opened the confirmation, Escape cancelled it. Screenshot: [`m38-13-skylink-operator-ui.png`](screens/m38-13-skylink-operator-ui.png). The real WebSocket was disconnected because no ARSY session/provider was used; this is visual and interaction evidence, not end-to-end provider evidence.
- Independent read-only review found no blocker in the bounded store query, admin-only route, redacted projection, UI, or screenshot; exact integrated-SHA CI remains pending.

## Security, rights, and rollback

The UI accepts only an existing ARSY bearer session and holds it in React memory; requests use `credentials: 'omit'`, reject redirects, and never send the SKYLINK service key. The WebSocket begins with the existing bearer auth frame. Pairing payloads are shown only to the authenticated operator and can be dismissed; start/logout require MoonUI confirmation. Delivery-attempt output is bounded and omits provider-controlled free text and external message IDs. No external content or new assets are introduced.

Rollback: remove `apps/skylink/client/**`, `apps/skylink/vite.config.mjs`, `apps/skylink/test/operator-ui.test.ts`; revert the manifest/lockfile and the focused test dependency assertion; remove the static-serving block in `src/server.ts`, the Skylink entries in both design gates, and this audit. Existing REST/WS service behavior remains independent.

**Limitations:** browser fixtures are synthetic; there was no real ARSY session, provider connection, or live WebSocket event. Exact integrated result SHA and CI remain pending because changes are uncommitted.
