# M46-28 — Focused Validation Matrix

**Status:** BASELINE ESTABLISHED · **Date:** 2026-10-31 · **Owner:** DX team

## Objective

Map package validation commands to changed-file scopes and prerequisites so developers run the minimum necessary checks for a given change set.

## Scope

1. Inventory all validation scripts (lint, typecheck, test, build) per package
2. Classify each by trigger scope (file patterns that necessitate it)
3. List prerequisites (env vars, build artifacts, service availability)
4. Check freshness (does the script reflect current toolchain?)
5. Document wording (what does success mean for each?)

## Package inventory

### Root workspace

| Command | Scope | Prerequisites | Fresh | Success meaning |
|---------|-------|---------------|-------|-----------------|
| `pnpm lint` | All `**/*.{ts,tsx,js,jsx}` | Node 24, pnpm 10.33.4 | YES | ESLint exits 0, 0 violations |
| `pnpm typecheck` | All `**/*.ts,tsx` | Node 24, pnpm 10.33.4 | YES | `tsc --noEmit` exits 0 across all packages |
| `pnpm test` | All `**/*.test.{ts,tsx}` | Node 24, pnpm 10.33.4 | YES | All test suites pass |
| `pnpm build` | All packages with build scripts | Node 24, pnpm 10.33.4 | YES | All packages produce dist/ output |
| `pnpm verify` | All above | Node 24, pnpm 10.33.4 | YES | lint + typecheck + test + build all pass |

### apps/arsy

| Command | Scope | Prerequisites | Fresh | Success meaning |
|---------|-------|---------------|-------|-----------------|
| `pnpm --filter arsy lint` | `apps/arsy/**/*.{ts,tsx}` | Node 24, pnpm 10.33.4 | YES | ESLint exits 0 |
| `pnpm --filter arsy typecheck` | `apps/arsy/**/*.ts` | Node 24, pnpm 10.33.4 | YES | tsc exits 0 |
| `pnpm --filter arsy test` | `apps/arsy/**/*.test.ts` | Node 24, pnpm 10.33.4, PostgreSQL (for integration) | YES | All tests pass |
| `pnpm --filter arsy build` | `apps/arsy/src/**/*` | Node 24, pnpm 10.33.4 | YES | dist/ produced |
| `pnpm --filter arsy dev` | N/A (runtime) | PostgreSQL, .env | YES | Server starts on port 3000 |

### apps/cockpit

| Command | Scope | Prerequisites | Fresh | Success meaning |
|---------|-------|---------------|-------|-----------------|
| `pnpm --filter cockpit lint` | `apps/cockpit/**/*.{ts,tsx}` | Node 24, pnpm 10.33.4 | YES | ESLint exits 0, token-pure |
| `pnpm --filter cockpit typecheck` | `apps/cockpit/**/*.ts,tsx` | Node 24, pnpm 10.33.4 | YES | tsc exits 0 |
| `pnpm --filter cockpit test` | `apps/cockpit/**/*.test.{ts,tsx}` | Node 24, pnpm 10.33.4 | YES | All tests pass |
| `pnpm --filter cockpit build` | `apps/cockpit/src/**/*` | Node 24, pnpm 10.33.4 | YES | dist/ produced |
| `pnpm --filter cockpit dev` | N/A (runtime) | ARSY API running | YES | Vite dev server on port 5173 |

### apps/dock

| Command | Scope | Prerequisites | Fresh | Success meaning |
|---------|-------|---------------|-------|-----------------|
| `pnpm --filter dock lint` | `apps/dock/**/*.{ts,tsx}` | Node 24, pnpm 10.33.4 | YES | ESLint exits 0 |
| `pnpm --filter dock typecheck` | `apps/dock/**/*.ts,tsx` | Node 24, pnpm 10.33.4 | YES | tsc exits 0 |
| `pnpm --filter dock test` | `apps/dock/**/*.test.{ts,tsx}` | Node 24, pnpm 10.33.4 | YES | All tests pass |
| `pnpm --filter dock build` | `apps/dock/src/**/*` | Node 24, pnpm 10.33.4 | YES | dist/ produced |

### apps/skylink

| Command | Scope | Prerequisites | Fresh | Success meaning |
|---------|-------|---------------|-------|-----------------|
| `pnpm --filter skylink lint` | `apps/skylink/**/*.ts` | Node 24, pnpm 10.33.4 | YES | ESLint exits 0 |
| `pnpm --filter skylink typecheck` | `apps/skylink/**/*.ts` | Node 24, pnpm 10.33.4 | YES | tsc exits 0 |
| `pnpm --filter skylink test` | `apps/skylink/**/*.test.ts` | Node 24, pnpm 10.33.4 | YES | All tests pass |
| `pnpm --filter skylink build` | `apps/skylink/src/**/*` | Node 24, pnpm 10.33.4 | YES | dist/ produced |

### apps/echolog

| Command | Scope | Prerequisites | Fresh | Success meaning |
|---------|-------|---------------|-------|-----------------|
| `pnpm --filter echolog lint` | `apps/echolog/**/*.ts` | Node 24, pnpm 10.33.4 | YES | ESLint exits 0 |
| `pnpm --filter echolog typecheck` | `apps/echolog/**/*.ts` | Node 24, pnpm 10.33.4 | YES | tsc exits 0 |
| `pnpm --filter echolog test` | `apps/echolog/**/*.test.ts` | Node 24, pnpm 10.33.4 | YES | All tests pass |
| `pnpm --filter echolog build` | `apps/echolog/src/**/*` | Node 24, pnpm 10.33.4 | YES | dist/ produced |

### apps/aigateway

| Command | Scope | Prerequisites | Fresh | Success meaning |
|---------|-------|---------------|-------|-----------------|
| `pnpm --filter aigateway lint` | `apps/aigateway/**/*.ts` | Node 24, pnpm 10.33.4 | YES | ESLint exits 0 |
| `pnpm --filter aigateway typecheck` | `apps/aigateway/**/*.ts` | Node 24, pnpm 10.33.4 | YES | tsc exits 0 |
| `pnpm --filter aigateway test` | `apps/aigateway/**/*.test.ts` | Node 24, pnpm 10.33.4 | YES | All tests pass |
| `pnpm --filter aigateway build` | `apps/aigateway/src/**/*` | Node 24, pnpm 10.33.4 | YES | dist/ produced |

### packages/*

| Package | lint | typecheck | test | build |
|---------|------|-----------|------|-------|
| packages/corpus | YES | YES | YES | YES |
| packages/moonql | YES | YES | YES | YES |
| packages/ui | YES | YES | YES (Storybook) | YES |
| packages/auth | YES | YES | YES | YES |
| packages/config | YES | YES | N/A | N/A |

## Change-scope mapping

### If you changed...

| File pattern | Run |
|--------------|-----|
| `apps/arsy/src/**/*.ts` | `pnpm --filter arsy verify` |
| `apps/cockpit/src/**/*.{ts,tsx}` | `pnpm --filter cockpit verify` |
| `apps/dock/src/**/*.{ts,tsx}` | `pnpm --filter dock verify` |
| `apps/skylink/src/**/*.ts` | `pnpm --filter skylink verify` |
| `apps/echolog/src/**/*.ts` | `pnpm --filter echolog verify` |
| `apps/aigateway/src/**/*.ts` | `pnpm --filter aigateway verify` |
| `packages/corpus/**/*.ts` | `pnpm --filter @moonradio/corpus verify` |
| `packages/moonql/**/*.ts` | `pnpm --filter @moonradio/moonql verify` |
| `packages/ui/**/*.{ts,tsx}` | `pnpm --filter @moonradio/ui verify` |
| `packages/auth/**/*.ts` | `pnpm --filter @moonradio/auth verify` |
| `packages/config/**/*.ts` | `pnpm lint && pnpm typecheck` |
| Root config files (`tsconfig.json`, `eslint.config.js`, `pnpm-workspace.yaml`) | `pnpm verify` |
| `.github/workflows/*.yml` | CI run (no local command) |
| `docs/**/*` | No validation required |
| `TODO.md` | No validation required |

## Prerequisites matrix

| Prerequisite | Required by | How to obtain |
|--------------|-------------|---------------|
| Node.js 24.x | All commands | `nvm install 24` |
| pnpm 10.33.4 | All commands | `corepack enable && corepack prepare pnpm@10.33.4 --activate` |
| PostgreSQL 15+ | `arsy test`, `arsy dev` | Docker: `docker compose up -d postgres` |
| ARSY API running | `cockpit dev` | Terminal 1: `pnpm --filter arsy dev` |
| `.env` file | `arsy dev`, `skylink dev` | Copy from `.env.example` |
| Internet access | `aigateway test` (provider calls) | N/A |
| GPU (optional) | `aigateway` local model inference | CUDA 12.x + compatible NVIDIA driver |

## Freshness check

**Last verified:** 2026-10-31  
**Toolchain:** Node 24.18.0, pnpm 10.33.4  
**ESLint config:** `eslint.config.js` (flat config)  
**TypeScript:** 5.6.x across all packages  
**Vitest:** 2.x for all test suites  
**Vite:** 5.x for frontend builds  

**Stale items:** NONE — all commands reflect current toolchain.

## Wording precision

Each command's success meaning is defined in the tables above. Key distinctions:

- **"ESLint exits 0"** = no lint violations (warnings allowed if not configured as errors)
- **"tsc exits 0"** = no type errors across the package
- **"All tests pass"** = Vitest reports 0 failures, 0 skipped (unless explicitly marked `.skip`)
- **"dist/ produced"** = build output exists in `packages/<name>/dist/` or `apps/<name>/dist/`
- **"verify"** = lint + typecheck + test + build all succeed in sequence

## Overlap analysis

- **M46-14** (Fastify schema validation): Audits runtime request/response validation, not build-time commands. No overlap.
- **M46-25** (deterministic test fixtures): Ensures tests are repeatable, not which tests to run. Complementary.
- **M46-27** (flaky tests): Identifies unreliable tests, not which tests to run. Complementary.

## Gaps and deferrals

1. **Automated scope detection:** No tool currently maps changed files → required commands. Developer must consult this document manually. **Deferred** until DX team has capacity to build a `scripts/validate-scope.ts` helper.
2. **Incremental validation:** No support for "run only tests affected by this change." All commands run the full suite for the package. **Deferred** until Vitest workspace support matures.
3. **Cross-package dependency validation:** If `packages/corpus` changes, should `apps/arsy` also be validated? Currently NO — each package is independent. **Deferred** until monorepo dependency graph is formalized.

## Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Developer runs wrong scope | Medium | Low (CI catches it) | This document |
| Prerequisite missing | Low | High (command fails) | Prerequisites matrix |
| Stale command | Low | Medium (false confidence) | Freshness check date |
| Command wording ambiguous | Low | Medium (misinterpretation) | Precise definitions above |

## Rollback plan

If this document causes confusion or is inaccurate:
1. Revert to ad-hoc validation (developer judgment)
2. Update document with corrections
3. Re-publish

## Metrics

**Track:**
- Number of CI failures that could have been caught locally (target: 0)
- Developer satisfaction with validation clarity (survey quarterly)
- Time from change to successful local validation (target: <2 min for scoped change)

## Success criteria

- [x] All packages have documented validation commands
- [x] Change-scope mapping covers common file patterns
- [x] Prerequisites are explicit and obtainable
- [x] Freshness check is dated
- [x] Wording is precise (no ambiguity)
- [ ] Automated scope detection (deferred)
- [ ] Incremental validation (deferred)
- [ ] Cross-package dependency validation (deferred)

## Evidence

- Package scripts: `apps/*/package.json`, `packages/*/package.json`
- Root config: `package.json`, `tsconfig.json`, `eslint.config.js`
- CI workflow: `.github/workflows/ci.yml`

## Approval

**Document owner:** DX team  
**Reviewed by:** Owner authority (M46-28 task)  
**Approved:** 2026-10-31  
**Next review:** 2027-01-31 (quarterly)
