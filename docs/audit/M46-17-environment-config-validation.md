# M46-17 — Environment Configuration Validation Audit

**Date:** 2026-10-30 · **HEAD:** `960891b`
**Purpose:** Audit environment variable parsing across all MoonWitness XV apps and propose fail-fast validation.

---

## 1. Summary Table

| App | Validation approach | Schema | Fail-fast | Status |
|-----|-------------------|--------|-----------|--------|
| ARSY | Zod `config.ts` with `parseConfig(process.env)` | `EnvSchema` (30+ keys) | Yes — throws before listen | Gold standard |
| SKYLINK | Zod `config.ts` with `parseConfig(process.env, argv)` | `ConfigSchema` (8 keys) | Yes — throws before listen | Compliant |
| ECHOLOG | Zod `config.ts` with `parseConfig(process.env, argv)` | `ConfigSchema` (13 keys) | Yes — throws before listen | Compliant |
| AIGateway | No validation; inline `process.env.*` reads in 6 files | None | No — boots with undefined keys | **Gap** |
| Cockpit | Config from TypeScript module (`moondeck.config.ts`), not env | None (static defaults) | N/A — no env contract | Informational |
| Orbit | No dedicated config; inline `process.env` reads in 2 server files | None | No — falls back to defaults | **Gap** |

---

## 2. Per-App Detail

### 2.1 ARSY (`apps/arsy/src/config.ts`)

- **Validation:** Zod `EnvSchema.safeParse()` with alias-resolution (`resolveAlias`) for legacy `RADIO_*` names.
- **Required vs optional:** `DATABASE_URL` required in production; `NODE_ENV`, `PORT`, `HOST`, `LOG_LEVEL`, `API_PREFIX`, `API_TITLE`, `API_VERSION` have safe defaults. Secrets (`SKYLINK_SERVICE_KEY`, `DENPA_TOKEN`) default to empty string with runtime guards (e.g. DENPA refuses to mount with empty token).
- **Secret redaction:** Error messages list only the key path and Zod issue text (e.g. `PORT: Expected number`); values are never interpolated into the thrown error.
- **Issues found:**
  - `apps/arsy/src/plugins/helmet.ts:11` — reads `process.env.NODE_ENV` directly instead of using `config.env`.
  - `apps/arsy/src/tools/gen-sdk.ts:192` — reads `process.env.MW_LOCALE` directly; this key is not in `EnvSchema`.

### 2.2 SKYLINK (`apps/skylink/src/config.ts`)

- **Validation:** Zod `ConfigSchema.safeParse()` with CLI `--port` override.
- **Required vs optional:** `DATABASE_URL` and `SKYLINK_SERVICE_KEY` required in production. Telegram bot token and webhook secret must be configured together. Service key minimum 32 chars when set.
- **Secret redaction:** Error messages use key paths only; secret values are never echoed.
- **Issues found:** None.

### 2.3 ECHOLOG (`apps/echolog/src/config.ts`)

- **Validation:** Zod `ConfigSchema.safeParse()` with CLI `--port` override and extensive cross-field checks (S3 credentials must be paired, bucket naming regex, secret minimum lengths, production requires service key + grant secret + S3 bucket).
- **Required vs optional:** `ECHOLOG_SERVICE_KEY`, `ECHOLOG_GRANT_SECRET`, `ECHOLOG_S3_BUCKET` required in production. S3 key pair must be configured together. All other keys have safe defaults.
- **Secret redaction:** Error messages reference key paths only; credential values are never included.
- **Issues found:** None.

### 2.4 AIGateway (`apps/aigateway/src/`)

- **Validation:** None. No `config.ts` exists.
- **Inline reads found:**
  - `index.ts:7-8` — `AI_GATEWAY_PORT`, `HOST`
  - `router.ts:27` — `AI_ENABLED`
  - `providers/gemini.ts:9` — `GEMINI_API_KEY`
  - `providers/openrouter.ts:13` — `OPENROUTER_API_KEY`
  - `providers/groq.ts:9` — `GROQ_API_KEY`
  - `providers/ollama.ts:9,14,20` — `OLLAMA_HOST`, `OLLAMA_DISABLED`, `OLLAMA_MODEL`
- **Required vs optional:** All reads use `??` fallbacks; nothing is required. API keys are silently undefined if not set.
- **Secret redaction:** No error messages are emitted at startup; secrets are never logged but are also never validated.
- **Issues found:** Zero startup validation. A misconfigured key (e.g. typo in `GEMINI_API_KEY`) silently degrades to heuristic-only mode with no diagnostic.

### 2.5 Cockpit (`apps/cockpit/src/config.ts`)

- **Validation:** Configuration comes from a TypeScript module (`moondeck.config.ts`) with static defaults merged at load time. No environment variable parsing.
- **Required vs optional:** Not applicable — all values are code-level defaults.
- **Secret redaction:** No secrets in config.
- **Issues found:**
  - `supervisor.ts:224` — `envFor()` spreads full `process.env` into every child service. This is intentional (children need `NODE_ENV`, `PATH`, etc.) but propagates any ambient secret to processes that may not need it.

### 2.6 Orbit (`apps/orbit/src/lib/server/`)

- **Validation:** No dedicated config module. Two server-only files read `process.env` directly.
- **Inline reads found:**
  - `arsy-runtime-client.ts:40,117` — `resolveHubEndpoint()` and `fetchOrbitState()` read `process.env` via `apiBaseUrl()` helper.
  - `review-surface.ts:55-57` — `resolveReviewSurface()` reads `NEXT_PUBLIC_HEADQUARTERS_URL`.
- **Required vs optional:** All reads fall back to loopback defaults from `FRONTEND_URLS`.
- **Secret redaction:** No secrets are read; no error messages expose values.
- **Issues found:** No schema validation. A malformed `NEXT_PUBLIC_HEADQUARTERS_URL` is caught by `validateReviewOrigin()` but only at call time, not at startup.

---

## 3. Key Risks

| Risk | Severity | App(s) |
|------|----------|--------|
| Zero startup validation — missing or malformed env keys silently degrade | High | AIGateway |
| Stray `process.env` reads bypass the validated config object | Low | ARSY (`helmet.ts`, `gen-sdk.ts`) |
| Full `process.env` propagated to child services — ambient secrets leak to processes that don't need them | Medium | Cockpit |
| Inline env reads without schema — no fail-fast, no central contract | Medium | Orbit |

---

## 4. Proposal

| Priority | Action | Owner app | Effort |
|----------|--------|-----------|--------|
| **P1** | Adopt Zod `config.ts` pattern (matching ARSY/SKYLINK/ECHOLOG) for AIGateway. Define schema for all 8 env keys, fail-fast at boot, redact secrets in errors. | AIGateway | Small |
| P2 | Consolidate `helmet.ts` and `gen-sdk.ts` stray reads into `config.ts` (add `MW_LOCALE` to schema or document as tool-only). | ARSY | Trivial |
| P3 | Document Cockpit `process.env` inheritance as intentional risk in deployment guide; consider an allow-list for child env propagation. | Cockpit | Small |
| P3 | Add a lightweight Zod schema for Orbit's two server env reads, or centralize them into a `config.ts`. | Orbit | Small |

---

## 5. Acceptance Criteria Mapping

| Criterion | ARSY | SKYLINK | ECHOLOG | AIGateway | Cockpit | Orbit |
|-----------|------|---------|---------|-----------|---------|-------|
| Missing required value exits before listen | YES | YES | YES | **NO** | N/A | **NO** |
| Diagnostics name key but never value | YES | YES | YES | YES (no diagnostics emitted) | N/A | YES |

---

## 6. Evidence

- **Source inspection:** `apps/*/src/config.ts` (or absence thereof) at HEAD `960891b`.
- **Inline `process.env` scan:** `grep -r 'process\.env' apps/{aigateway,orbit,cockpit,arsy}/src/` — results documented in sections 2.1–2.6.
- **Diagnostic script:** `scripts/diagnostics/environment-doctor.mjs` exists but audits tool versions and Git baseline, not app env contracts. No app-level config validation script was found.

---

## 7. Unresolved Items

| Item | Status | Blocker |
|------|--------|---------|
| AIGateway `config.ts` module not yet implemented | Open | P1 proposal above |
| ARSY `helmet.ts` and `gen-sdk.ts` stray reads not consolidated into `config.ts` | Open | P2 proposal above |
| Cockpit `process.env` inheritance not documented as intentional risk in deployment guide | Open | P3 proposal above |
| Orbit inline reads lack schema validation | Open | P3 proposal above |
