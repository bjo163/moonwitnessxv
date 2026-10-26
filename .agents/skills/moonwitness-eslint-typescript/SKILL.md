---
name: moonwitness-eslint-typescript
description: Prepare or review MoonWitness XV TypeScript changes against the live package config, central ESLint rules, and file-specific overrides before coding.
---

# MoonWitness XV TypeScript and ESLint

Use for authorized TypeScript changes or when diagnosing a lint/type error. This skill provides coding guidance; it does not authorize a TODO task, alter lint policy, or run broad checks during preparation-only work.

## Inspect before editing

1. Record the branch, SHA, and existing changes. Read [TODO.md](../../../TODO.md) and the relevant task packet; preparation work never authorizes implementation.
2. Inspect the target, its nearest working counterpart, the owning package manifest, and its `tsconfig.json`.
3. Read [the central ESLint entrypoint](../../../eslint.config.mjs), [rule factory](../../../packages/eslint-config/src/index.js), and [custom plugin](../../../packages/eslint-config/src/plugin.js). Identify which config blocks actually match the target path. Do not infer that a rule applies merely because it exists in source.
4. Search the owning package for an existing type, helper, schema, component, or service before adding another. Keep changes local to the authorized scope.

## Verified compiler and lint behavior

The shared [base TypeScript config](../../../tsconfig.base.json) uses strict mode, `noUncheckedIndexedAccess`, `NodeNext` module resolution, ES2022, composite and incremental builds, and consistent filename casing. Package configs can override these values; the Dock Next config, for example, uses `moduleResolution: bundler`. Check the target package rather than assuming one module model everywhere.

The central config applies type-checked TypeScript rules to `**/*.{ts,tsx}`. Important active settings include:

- Errors: `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-floating-promises`, `@typescript-eslint/no-misused-promises`, `@typescript-eslint/consistent-type-imports`, `@typescript-eslint/no-unused-vars` (names beginning `_` are exempt; rest siblings are ignored), `@typescript-eslint/prefer-as-const`, `@typescript-eslint/adjacent-overload-signatures`, `@typescript-eslint/no-extra-non-null-assertion`, core `eqeqeq` (`null` comparisons exempt), `prefer-const`, and `no-var`.
- Warning: `@typescript-eslint/no-non-null-assertion`.
- Core `no-console` is an error except `console.warn`, `console.error`, and `console.info`; selected script/config blocks turn it off.
- Core `max-lines` (1800), `max-lines-per-function` (450), `max-depth` (8), `max-nested-callbacks` (5), `max-len` (200), and `complexity` (50) are warnings, not errors.
- TypeScript blocks turn core `no-unused-vars` and `no-undef` off, then use the TypeScript unused-vars rule. Global ignores include build output, generated SDK, `next-env.d.ts`, coverage, and public assets.

Test overrides apply only to `apps/radio/test/**/*.ts` and `test/**/*.ts`: they turn off non-null assertion and floating-promise rules and the custom theological rule, and turn off `require-await`. Do not assume these exemptions apply to app source or TSX tests.

## Type-safe patterns

Use the actual domain type and narrow untrusted values; don't add `any` to silence a mismatch. With `noUncheckedIndexedAccess`, handle an absent lookup explicitly:

```ts
const first = rows[0]
if (!first) return null
return first.id
```

Use type-only imports for types, as required by `consistent-type-imports`:

```ts
import type { FastifyInstance } from 'fastify'
```

Await work whose result or failure matters. If a callback intentionally starts background work, make the rejection path explicit:

```ts
void record().catch((error: unknown) => {
  logger.warn({ err: error }, 'background operation failed')
})
```

Do not pass an `async` callback to an API expecting a synchronous callback unless that API explicitly supports promises; `no-misused-promises` is an error. Prefer `const`, strict equality (with the configured `null` exception), and repository ESM import conventions. A non-null assertion is only a warning, but prefer a runtime guard or a type that proves the invariant.

## Rule scope and custom plugin

`@moonwitness/eslint-config` is imported by the root config and its plugin is registered in the TypeScript and selected React blocks. `no-theological-sameas` is enabled for TypeScript files and disabled by the test override. `require-rights-veto` and `enforce-token-purity` are implemented in the plugin source but are not enabled by the current central config. Do not describe them as enforced. `react-hooks/rules-of-hooks` is an error and `react-hooks/exhaustive-deps` a warning only for TSX under Dock, Headquarters, MoonUI, and `apps/cockpit/client`.

Architecture restrictions are path-specific: see [the boundaries skill](../moonwitness-monorepo-boundaries/SKILL.md). Script/config files have a separate JavaScript block; `**/drizzle.config.ts` and `**/*.config.mjs` use `disableTypeChecked`. Generated/ignored paths do not receive ordinary lint coverage.

Never suppress a rule broadly, weaken TypeScript, exclude a file, or use `any` as an escape hatch to make a check green. Do not run `lint:fix` across the repository and accept unrelated edits. If a configured rule conflicts with a legitimate behavior, report the file, rule, matching config block, and smallest proposed change for separate authorization.

## Checks for separately authorized coding

Read the current root and package scripts first. The root `lint` is `eslint .`; `typecheck` is recursive; `verify` chains builds, UI checks, lint, SDK check, tests, and web builds. `lint:fix` is `eslint . --fix` and can rewrite the tree. These are broad operations, not automatic skill steps.

For an authorized change, prefer `pnpm exec eslint <changed-file>` and the owning package's existing `typecheck` script when available (observed in Dock, Radio, and Core). Run broader checks only when the task scope and owner authorize them. State separately which commands ran and which are recommendations. Do not run any application or broad check as part of this preparation phase.

Outcome: identify the matching config, package owner, nearest pattern, minimal edit plan, and the narrowest authorized check; report uncertainty instead of inventing a rule or type.
