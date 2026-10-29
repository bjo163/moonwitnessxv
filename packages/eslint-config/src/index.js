/**
 * packages/eslint-config/src/index.js
 *
 * Centralized ESLint Flat Configuration for Moonwitness XV.
 * Single source of truth for all monorepo apps and packages.
 */

import process from 'node:process'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import { moonwitnessPlugin } from './plugin.js'

export { moonwitnessPlugin }

export const GLOBAL_IGNORES = [
  'node_modules/**',
  '**/node_modules/**',
  '**/dist/**',
  '**/out/**',
  '**/.next/**',
  '**/*.tsbuildinfo',
  'packages/moonql/drizzle/meta/**',
  'packages/moonql-client/src/generated.ts',
  '**/next-env.d.ts',
  '**/.next/types/**',
  'coverage/**',
  '**/public/**',
  // Per-agent teamwork workspaces under .agents/ are machine-local scratch
  // content (gitignored at .gitignore:19). They are not repository source and
  // must not be linted.
  '.agents/teamwork/**',
]

export const typescriptRules = {
  ...tseslint.configs.recommendedTypeChecked.rules,
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
  ],
  '@typescript-eslint/no-non-null-assertion': 'warn',
  '@typescript-eslint/prefer-as-const': 'error',
  '@typescript-eslint/adjacent-overload-signatures': 'error',
  '@typescript-eslint/no-extra-non-null-assertion': 'error',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/no-unsafe-return': 'off',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  'prefer-const': 'error',
  'no-var': 'error',
  'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
  'require-await': 'off',

  // --- Strict Clean Code, Modularity & Line Limits ---
  'max-lines': ['warn', { max: 1800, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['warn', { max: 450, skipBlankLines: true, skipComments: true, IIFEs: true }],
  'max-depth': ['warn', { max: 8 }],
  'max-nested-callbacks': ['warn', { max: 5 }],
  'max-len': [
    'warn',
    {
      code: 200,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true,
      ignoreRegExpLiterals: true,
    },
  ],
  complexity: ['warn', { max: 50 }],
  'no-self-compare': 'error',
  'no-unneeded-ternary': 'error',
  'prefer-object-spread': 'error',
  yoda: ['error', 'never'],
}

/**
 * Creates the complete flat ESLint config for Moonwitness monorepo.
 */
export function createMoonwitnessConfig(options = {}) {
  const tsconfigRootDir = options.tsconfigRootDir || process.cwd()

  return tseslint.config(
    { ignores: GLOBAL_IGNORES },

    eslint.configs.recommended,

    // 1. TypeScript Rules across all workspace packages
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: {
        '@typescript-eslint': tseslint.plugin,
        '@moonwitness': moonwitnessPlugin,
      },
      rules: {
        ...typescriptRules,
        'no-unused-vars': 'off',
        'no-undef': 'off',
        '@moonwitness/no-theological-sameas': 'error',
      },
    },

    // 2. React Hooks (Dock, HQ, MoonUI, Cockpit and ECHOLOG operator clients)
    {
      files: ['apps/dock/**/*.tsx', 'apps/headquarters/**/*.tsx', 'packages/moonui/**/*.tsx', 'apps/cockpit/client/**/*.tsx', 'apps/echolog/client/**/*.tsx', 'apps/skylink/client/**/*.tsx', 'apps/orbit/**/*.tsx'],
      plugins: {
        'react-hooks': reactHooks,
        '@moonwitness': moonwitnessPlugin,
      },
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },

    // 3. Monorepo Architecture Isolation Boundaries
    {
      files: ['apps/**/*.{ts,tsx}', 'packages/moonql-*/**/*.{ts,tsx}', 'packages/denpa/**/*.{ts,tsx}', 'packages/skylink-whatsapp/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['drizzle-orm', 'drizzle-orm/*', 'postgres'],
                message: 'hanya @moonwitness/moonql yang boleh menyentuh drizzle/postgres; deklarasikan model, jangan bangun SQL',
              },
            ],
          },
        ],
      },
    },

    // Addon data tidak boleh tahu ada fastify di bawahnya; ia menerima ctx.
    {
      files: ['packages/moonql-*/src/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [
              { name: 'fastify', message: 'addon menerima EndpointCtx/ProvideCtx, bukan fastify' },
              { name: 'drizzle-orm', message: 'hanya @moonwitness/moonql yang menyentuh drizzle' },
              { name: 'postgres', message: 'hanya @moonwitness/moonql yang menyentuh driver' },
            ],
          },
        ],
      },
    },

    // `core` ikut ter-bundle ke browser; built-in node adalah lubang runtime.
    {
      files: ['packages/core/src/**/*.{ts,tsx}', 'packages/types/src/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['node:*', 'fs', 'path', 'crypto', 'os', 'http'],
                message: '@moonwitness/core dan @moonwitness/types harus web-safe: tidak ada built-in Node',
              },
            ],
          },
        ],
      },
    },

    // crypto hanya di tempat yang memang memegang rahasia.
    {
      files: [
        'apps/**/*.{ts,tsx}',
        'packages/moonql-client/**/*.{ts,tsx}',
        'packages/moonui/**/*.{ts,tsx}',
        'packages/moonql-base/**/*.{ts,tsx}',
        'packages/moonql-settings/**/*.{ts,tsx}',
        'packages/moonql-schedule/**/*.{ts,tsx}',
        'packages/moonql-stations/**/*.{ts,tsx}',
        'packages/moonql-ops/**/*.{ts,tsx}',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['node:crypto'],
                message: 'hash/pseudonym adalah hak milik modul yang menyimpan hasilnya (lihat moonql-auth, moonql-apikeys, moonql-playlog)',
              },
            ],
          },
        ],
      },
    },

    // 4. Scripts & Build Configs
    {
      files: [
        'scripts/**/*.mjs',
        'apps/*/next.config.mjs',
        'apps/arsy/src/tools/**/*.ts',
        'packages/cli/**/*.{ts,js}',
        '*.config.mjs',
        '*.config.js',
        // Node test runners (*.mjs) under package test/ dirs: they execute in
        // the Node runtime, so the same runtime globals declared above apply.
        // (Root test/ and app test/ *.mjs already pass via explicit
        // `import process from 'node:process'`-style imports and inline
        // `/* global */` comments; adding globals there would trip
        // no-redeclare, so the pattern is scoped to packages/*/test only.)
        'packages/*/test/**/*.mjs',
      ],
      languageOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        globals: {
          process: 'readonly',
          console: 'readonly',
          URL: 'readonly',
          TextEncoder: 'readonly',
          fetch: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          setInterval: 'readonly',
          clearInterval: 'readonly',
        },
      },
      rules: { 'no-console': 'off' },
    },

    {
      files: ['apps/arsy/src/tools/**/*.ts'],
      rules: { 'no-console': 'off' },
    },

    {
      files: ['**/drizzle.config.ts', '**/*.config.mjs'],
      ...tseslint.configs.disableTypeChecked,
    },

    // 5. Test Files
    {
      files: [
        'apps/arsy/test/**/*.ts',
        'test/**/*.ts',
        'apps/aigateway/test/**/*.ts',
        'packages/moonui/test/**/*.ts',
        'packages/skylink-whatsapp/test/**/*.ts',
      ],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@moonwitness/no-theological-sameas': 'off',
      },
    },

    // node:test fixtures in MoonUI's tests import the full token surface for
    // drift coverage; some re-exports are asserted through the module object,
    // so unused named imports here are not dead code in the app sense.
    {
      files: ['packages/moonui/test/**/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    }
  )
}

export default createMoonwitnessConfig
