#!/usr/bin/env node
/**
 * App Factory (M05-18) — collision-safe workspace scaffolder with dry-run.
 *
 *   pnpm app:create new-app --dry-run          # preview the rendered file list, no writes
 *   pnpm app:create new-app                    # validate, print the list, then create apps/new-app
 *   node scripts/app-create.mjs new-app --variant worker --locale id
 *
 * Policy honored from the M05-17 inventory (docs/audit/M05-17-app-factory-inventory.md):
 * conservative lowercase URL-safe slug; reject separators, traversal, encoded
 * variants, reserved/existing names and any existing destination before
 * writing; one `@moonwitness/<slug>` private workspace app; no public port, no
 * database, no second Hub, not wired into the default runner/Docker/Compose.
 *
 * Deliberate scope limits: the `frontend` variant now emits a minimal React
 * skeleton that inherits the shared i18n contract (packages/core) and MoonUI
 * (M05-19); the worker process/health configuration still lands in M05-20.
 * Generated entry points are inert placeholders on purpose: the skeleton never
 * fabricates a backend, a public port, a database, a second Hub or a
 * Docker/Compose/runner wiring (M05-17 boundary).
 *
 * Locale stance (M05-10/M05-23): human-facing output uses an id/en catalog with
 * stable message keys, selected by `--locale id|en`, then a valid `MW_LOCALE`,
 * then the `en` default; an invalid explicit locale exits 1 with a message in
 * the available locale. `scripts/*.mjs` stay plain JS with no package
 * dependencies, so this catalog is self-contained here and mirrors the shared
 * CLI's selection contract (the canonical operator catalog lives in
 * packages/cli/src/locale.ts).
 */
import { closeSync, existsSync, fstatSync, lstatSync, mkdirSync, openSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const repoRoot = resolve(dirname(dirname(fileURLToPath(import.meta.url))))

const SLUG_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 40

// Names the factory must never emit, whether or not a directory exists today:
// current workspace apps (M05-17 list), the manifest-less `apps/api` residue,
// package-scope/word collisions, and repository infrastructure directories.
const RESERVED_NAMES = Object.freeze([
  'aigateway', 'api', 'app', 'apps', 'arsy', 'bin', 'build', 'cli', 'cockpit',
  'core', 'dist', 'dock', 'docs', 'echolog', 'headquarters', 'moon',
  'moonwitness', 'node_modules', 'packages', 'radio', 'scripts', 'sentinel',
  'skylink', 'template', 'templates',
])

const VARIANTS = Object.freeze({
  worker: { implemented: true, ownerNote: 'M05-20 completes process/health configuration' },
  frontend: { implemented: true, ownerNote: 'M05-19: inherits shared i18n (packages/core) + MoonUI' },
})

/**
 * Stable-keyed id/en catalog for this CLI. Keys are part of the human-facing
 * contract (M05-23 stance): rename only together with both locales and tests.
 */
export const factoryCopy = Object.freeze({
  en: {
    usage: 'Usage: node scripts/app-create.mjs <slug> [--variant worker|frontend] [--dry-run] [--locale id|en] [--help]',
    optionsHeading: 'Options:',
    variantOption: '--variant <name>  Workspace variant (default: worker).',
    dryRunOption: '--dry-run         Print the rendered file list without writing anything.',
    localeOption: '--locale id|en    Select human-facing language (or set MW_LOCALE).',
    helpOption: '--help            Show this usage text.',
    variantsHeading: 'Variants:',
    variantWorker: 'worker    Private internal app: no UI, no public port, no database (M05-20 completes service configuration).',
    variantFrontend: 'frontend  Minimal React app inheriting the shared i18n catalog (packages/core) and MoonUI (M05-19).',
    dryRunHeading: 'DRY RUN — files that would be created (no writes):',
    writeHeading: 'Files to create:',
    fileLine: '  {path}',
    created: 'App Factory: created {count} file(s) under {dir}.',
    refusedMissingSlug: 'App Factory: an app slug is required. {usage}',
    refusedTraversal: 'App Factory: "{slug}" looks like a path traversal or absolute path — slugs must not contain separators, "..", drive letters, or encoded variants.',
    refusedReserved: 'App Factory: "{slug}" is a reserved name and cannot be used as an app slug.',
    refusedLength: 'App Factory: "{slug}" must be {min}-{max} characters long.',
    refusedInvalid: 'App Factory: "{slug}" is not a valid app slug — use {min}-{max} characters, lowercase letters and digits, single internal hyphens, starting with a letter.',
    refusedExists: 'App Factory: refusing to overwrite {dir} — it already exists. Pick a new slug or remove the existing app deliberately first.',
    refusedExistingFile: 'App Factory: refusing to overwrite {path} — it already exists.',
    refusedUnknownOption: 'App Factory: unknown or incomplete option "{option}".',
    refusedUnknownVariant: 'App Factory: unknown variant "{variant}". Supported variants: {variants}.',
    refusedVariantPlanned: 'App Factory: the "{variant}" variant is planned by M05-19 and is not implemented yet; no files were written.',
    refusedMissingAppsDir: 'App Factory: no apps/ directory under {root} — run this script from the repository root.',
    localeMissing: 'Missing locale value. Use --locale id or --locale en.',
    localeInvalid: 'Unsupported locale "{locale}". Use --locale id or --locale en.',
  },
  id: {
    usage: 'Penggunaan: node scripts/app-create.mjs <slug> [--variant worker|frontend] [--dry-run] [--locale id|en] [--help]',
    optionsHeading: 'Opsi:',
    variantOption: '--variant <nama>  Varian workspace (bawaan: worker).',
    dryRunOption: '--dry-run         Tampilkan daftar berkas hasil render tanpa menulis apa pun.',
    localeOption: '--locale id|en    Pilih bahasa keluaran (atau atur MW_LOCALE).',
    helpOption: '--help            Tampilkan teks penggunaan ini.',
    variantsHeading: 'Varian:',
    variantWorker: 'worker    Aplikasi internal privat: tanpa UI, tanpa port publik, tanpa database (M05-20 melengkapi konfigurasi layanan).',
    variantFrontend: 'frontend  Aplikasi React minimal yang mewarisi katalog i18n bersama (packages/core) dan MoonUI (M05-19).',
    dryRunHeading: 'PRATINJAU — berkas yang akan dibuat (tidak ada penulisan):',
    writeHeading: 'Berkas yang akan dibuat:',
    fileLine: '  {path}',
    created: 'App Factory: {count} berkas dibuat di {dir}.',
    refusedMissingSlug: 'App Factory: slug aplikasi wajib diberikan. {usage}',
    refusedTraversal: 'App Factory: "{slug}" terlihat seperti traversal path atau path absolut — slug tidak boleh mengandung pemisah, "..", huruf drive, atau varian terenkode.',
    refusedReserved: 'App Factory: "{slug}" adalah nama cadangan dan tidak dapat dipakai sebagai slug aplikasi.',
    refusedLength: 'App Factory: "{slug}" harus terdiri dari {min}-{max} karakter.',
    refusedInvalid: 'App Factory: "{slug}" bukan slug aplikasi yang sah — gunakan {min}-{max} karakter, huruf kecil dan angka, tanda hubung tunggal di tengah, diawali huruf.',
    refusedExists: 'App Factory: menolak menimpa {dir} — sudah ada. Pilih slug lain atau hapus aplikasi yang ada secara sengaja terlebih dulu.',
    refusedExistingFile: 'App Factory: menolak menimpa {path} — sudah ada.',
    refusedUnknownOption: 'App Factory: opsi tidak dikenal atau tidak lengkap "{option}".',
    refusedUnknownVariant: 'App Factory: varian "{variant}" tidak dikenal. Varian yang didukung: {variants}.',
    refusedVariantPlanned: 'App Factory: varian "{variant}" direncanakan pada M05-19 dan belum diimplementasikan; tidak ada berkas yang ditulis.',
    refusedMissingAppsDir: 'App Factory: tidak ada direktori apps/ di dalam {root} — jalankan skrip ini dari akar repositori.',
    localeMissing: 'Nilai bahasa belum diberikan. Gunakan --locale id atau --locale en.',
    localeInvalid: 'Bahasa "{locale}" tidak didukung. Gunakan --locale id atau --locale en.',
  },
})

function fillTemplate(message, values) {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    message,
  )
}

export function factoryMessage(locale, key, values = {}) {
  const catalog = factoryCopy[locale] ?? factoryCopy.en
  const template = catalog[key] ?? factoryCopy.en[key]
  if (template === undefined) throw new Error(`Unknown App Factory message key: ${key}`)
  return fillTemplate(template, values)
}

export function resolveFactoryLocale(args, environmentLocale) {
  const environmentDefault = environmentLocale === 'id' || environmentLocale === 'en'
    ? environmentLocale
    : 'en'
  const remaining = []
  let requested
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--locale') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) return { ok: false, locale: environmentDefault, error: 'missing' }
      if (requested !== undefined) return { ok: false, locale: environmentDefault, error: 'unsupported', value }
      requested = value
      index += 1
    } else if (argument.startsWith('--locale=')) {
      if (requested !== undefined) return { ok: false, locale: environmentDefault, error: 'unsupported', value: argument.slice(9) }
      requested = argument.slice(9)
    } else {
      remaining.push(argument)
    }
  }
  if (requested !== undefined) {
    if (requested !== 'id' && requested !== 'en') return { ok: false, locale: environmentDefault, error: 'unsupported', value: requested }
    return { ok: true, locale: requested, args: remaining }
  }
  return { ok: true, locale: environmentDefault, args: remaining }
}

function looksLikeTraversal(value) {
  return (
    value.includes('..')
    || value.includes('/')
    || value.includes('\\')
    || value.includes(':')
    || /%2e|%2f|%5c/i.test(value)
  )
}

/**
 * Validate one candidate slug. `reason` is a stable machine code; the matching
 * `refused*` catalog key carries the human-facing copy. Returns
 * { ok: true } or { ok: false, reason, value }.
 */
export function validateAppSlug(slug, { reserved = RESERVED_NAMES } = {}) {
  if (typeof slug !== 'string' || slug === '') return { ok: false, reason: 'missingSlug', value: '' }
  if (looksLikeTraversal(slug)) return { ok: false, reason: 'traversal', value: slug }
  if (reserved.includes(slug.toLowerCase())) return { ok: false, reason: 'reserved', value: slug }
  if (slug.length < SLUG_MIN_LENGTH || slug.length > SLUG_MAX_LENGTH) {
    return { ok: false, reason: 'length', value: slug }
  }
  if (!SLUG_PATTERN.test(slug)) return { ok: false, reason: 'invalid', value: slug }
  return { ok: true }
}

/** Defense in depth: the target must land exactly on apps/<slug>, never elsewhere. */
export function resolveTargetPath(root, slug) {
  const appsDir = join(root, 'apps')
  const target = join(appsDir, slug)
  const rel = relative(appsDir, target)
  if (rel !== slug || rel.includes('..') || rel.includes('/') || rel.includes('\\') || rel === '') {
    throw new Error(`unsafe app target: ${target}`)
  }
  return target
}

export function listExistingApps(root) {
  const appsDir = join(root, 'apps')
  try {
    return readdirSync(appsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  } catch {
    return []
  }
}

/** Deterministic rendered file list for a validated slug/variant. */
export function planFiles(slug, variant = 'worker') {
  if (variant === 'frontend') return planFrontendFiles(slug)

  const packageManifest = {
    name: `@moonwitness/${slug}`,
    version: '0.1.0',
    private: true,
    type: 'module',
    description: `MoonWitness XV internal worker app ${slug} (generated by the App Factory).`,
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      dev: 'node --watch --import tsx --env-file-if-exists=../../.env src/index.ts',
      build: 'tsc -b',
      start: 'node --env-file-if-exists=../../.env dist/index.js',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      '@moonwitness/core': 'workspace:*',
    },
    devDependencies: {
      '@types/node': '^22.10.5',
      tsx: '^4.19.2',
      typescript: '^5.7.3',
    },
  }

  const tsconfig = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      rootDir: './src',
      outDir: './dist',
    },
    include: ['src'],
    exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    references: [{ path: '../../packages/core' }],
  }

  const entrySource = [
    `// ${slug} — generated by the App Factory (scripts/app-create.mjs, M05-18).`,
    '// Internal worker lifecycle only: no UI, network listener, database or Hub client.',
    "import { runWorker, type WorkerTask } from './worker-runtime.js'",
    '',
    'const controller = new AbortController()',
    "for (const signal of ['SIGINT', 'SIGTERM'] as const) {",
    '  process.once(signal, () => controller.abort())',
    '}',
    '',
    'const task: WorkerTask = async (signal) => {',
    '  if (signal.aborted) return',
    '  await new Promise<void>((resolve) => {',
    '    const finish = () => resolve()',
    "    signal.addEventListener('abort', finish, { once: true })",
    '    if (signal.aborted) finish()',
    '  })',
    '}',
    '',
    'void runWorker(task, controller.signal).catch((error: unknown) => {',
    '  const code = error instanceof Error && \'code\' in error ? String(error.code) : \'WORKER_FAILED\'',
    '  console.error(`WORKER_ERROR:${code}`)',
    '  process.exitCode = 1',
    '})',
    '',
  ].join('\n')

  const workerRuntimeSource = [
    `// ${slug} in-process worker lifecycle and health state (M05-20).`,
    "export type WorkerHealthStatus = 'starting' | 'ready' | 'stopping' | 'stopped' | 'failed'",
    'export interface WorkerHealth {',
    '  readonly status: WorkerHealthStatus',
    '  readonly healthy: boolean',
    '}',
    'export type WorkerTask = (signal: AbortSignal) => Promise<void>',
    '',
    "export const WORKER_ERROR_CODES = Object.freeze({ failed: 'WORKER_FAILED' } as const)",
    'let status: WorkerHealthStatus = \'starting\'',
    '',
    'export function getWorkerHealth(): WorkerHealth {',
    "  return { status, healthy: status === 'ready' }",
    '}',
    '',
    'export class WorkerRuntimeError extends Error {',
    "  readonly code = WORKER_ERROR_CODES.failed",
    '  constructor() {',
    "    super('Worker task failed')",
    "    this.name = 'WorkerRuntimeError'",
    '  }',
    '}',
    '',
    'export async function runWorker(task: WorkerTask, signal: AbortSignal): Promise<void> {',
    '  status = \'ready\'',
    "  signal.addEventListener('abort', () => { status = 'stopping' }, { once: true })",
    '  try {',
    '    await task(signal)',
    "    status = 'stopped'",
    '  } catch {',
    "    status = 'failed'",
    '    throw new WorkerRuntimeError()',
    '  }',
    '}',
    '',
  ].join('\n')

  const readme = [
    `# @moonwitness/${slug}`,
    '',
    'Generated by the App Factory (`pnpm app:create`, M05-18). Variant: ' + variant + '.',
    '',
    '- Private internal worker: no UI, network listener, public port, database or second Hub.',
    '- Exposes only in-process health state; process signals request graceful shutdown.',
    '- Stable machine failure code: `WORKER_FAILED`; detailed exception text is not logged.',
    '- Next owners: M05-21 (integration), then M05-22 (adoption/rollback gate).',
    `- Rollback before integration: delete \`apps/${slug}\`; the factory never rewrites an existing directory.`,
    '',
  ].join('\n')

  return [
    { relPath: join('apps', slug, 'package.json'), content: `${JSON.stringify(packageManifest, null, 2)}\n` },
    { relPath: join('apps', slug, 'tsconfig.json'), content: `${JSON.stringify(tsconfig, null, 2)}\n` },
    { relPath: join('apps', slug, 'src', 'index.ts'), content: `${entrySource}\n` },
    { relPath: join('apps', slug, 'src', 'worker-runtime.ts'), content: `${workerRuntimeSource}\n` },
    { relPath: join('apps', slug, 'README.md'), content: `${readme}\n` },
  ]
}

/**
 * Frontend skeleton (M05-19). Inherits the shared i18n contract from
 * `@moonwitness/core` (defineLocaleCatalog / getLocaleMessage / resolveLocale /
 * isLocale / SUPPORTED_LOCALES) and the shared design system from
 * `@moonwitness/moonui` — no duplicated locale engine, no second catalog
 * builder, no hardcoded UI strings outside the id/en catalog. Includes a
 * working id/en selector, a small locale-prefixed routing scaffold and
 * accessibility labels. Never fabricates a backend, port, database, Hub or
 * Docker/Compose/runner wiring (M05-17 boundary).
 */
function planFrontendFiles(slug) {
  const packageManifest = {
    name: `@moonwitness/${slug}`,
    version: '0.1.0',
    private: true,
    type: 'module',
    description: `MoonWitness XV frontend app ${slug} (generated by the App Factory; inherits @moonwitness/core i18n and @moonwitness/moonui).`,
    scripts: {
      dev: 'vite',
      build: 'vite build',
      lint: 'eslint src --ext .ts,.tsx',
      test: 'tsx --test test/**/*.test.ts',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      '@moonwitness/core': 'workspace:*',
      '@moonwitness/moonui': 'workspace:*',
      react: '^19.3.1',
      'react-dom': '^19.3.1',
    },
    devDependencies: {
      '@types/react': '^19.3.0',
      '@types/react-dom': '^19.3.0',
      '@vitejs/plugin-react': '^6.1.2',
      tsx: '^4.23.15',
      typescript: '^5.7.3',
      vite: '^8.3.5',
    },
  }

  const tsconfig = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      noEmit: true,
      composite: false,
      incremental: false,
      declaration: false,
      declarationMap: false,
      module: 'ESNext',
      moduleResolution: 'Bundler',
      jsx: 'react-jsx',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      types: ['react', 'react-dom'],
      rootDir: './src',
      outDir: './dist',
    },
    include: ['src'],
  }

  const viteConfig = [
    `// ${slug} — Vite build/serve config for the App Factory frontend skeleton.`,
    '// Registers React only: no dev-server port, no proxy, no backend wiring.',
    "import { defineConfig } from 'vite'",
    "import react from '@vitejs/plugin-react'",
    '',
    'export default defineConfig({',
    '  plugins: [react()],',
    '})',
    '',
  ].join('\n')

  const indexHtml = [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    `    <title>${slug}</title>`,
    '  </head>',
    '  <body>',
    '    <div id="root"></div>',
    '    <script type="module" src="/src/main.tsx"></script>',
    '  </body>',
    '</html>',
    '',
  ].join('\n')

  const viteEnv = [
    '// Ambient declarations so CSS side-effect imports typecheck under `tsc`.',
    "declare module '*.css'",
    '',
  ].join('\n')

  const localeSource = [
    `// ${slug} locale — inherits the shared id/en i18n contract from @moonwitness/core.`,
    '// No second i18n engine and no duplicated catalog builder: defineLocaleCatalog,',
    '// getLocaleMessage, resolveLocale and the locale guards all come from the shared',
    '// package (M05-10). This module only declares this app\'s UI strings.',
    "import {",
    '  DEFAULT_LOCALE,',
    '  SUPPORTED_LOCALES,',
    '  defineLocaleCatalog,',
    '  getLocaleMessage,',
    '  resolveLocale,',
    '  type Locale,',
    '  type LocaleCatalog,',
    "} from '@moonwitness/core'",
    '',
    'export type AppCopyKey =',
    "  | 'appTitle'",
    "  | 'appSubtitle'",
    "  | 'languageLabel'",
    "  | 'navigationLabel'",
    "  | 'homeHeading'",
    "  | 'homeBody'",
    "  | 'aboutHeading'",
    "  | 'aboutBody'",
    "  | 'routeHome'",
    "  | 'routeAbout'",
    '',
    '// Identical stable keys in both locales; a missing/extra key throws at load.',
    'export const appCopy: LocaleCatalog<AppCopyKey> = defineLocaleCatalog<AppCopyKey>({',
    '  en: {',
    `    appTitle: '${slug}',`,
    "    appSubtitle: 'Frontend skeleton generated by the App Factory (M05-19).',",
    "    languageLabel: 'Language',",
    "    navigationLabel: 'Main navigation',",
    "    homeHeading: 'Welcome',",
    "    homeBody: 'This sample app inherits the shared id/en i18n contract and MoonUI.',",
    "    aboutHeading: 'About',",
    "    aboutBody: 'Routing, the locale selector and every label come from the shared catalog.',",
    "    routeHome: 'Home',",
    "    routeAbout: 'About',",
    '  },',
    '  id: {',
    `    appTitle: '${slug}',`,
    "    appSubtitle: 'Kerangka frontend yang dibuat App Factory (M05-19).',",
    "    languageLabel: 'Bahasa',",
    "    navigationLabel: 'Navigasi utama',",
    "    homeHeading: 'Selamat datang',",
    "    homeBody: 'Contoh aplikasi ini mewarisi kontrak i18n id/en bersama dan MoonUI.',",
    "    aboutHeading: 'Tentang',",
    "    aboutBody: 'Perutean, pemilih bahasa, dan setiap label berasal dari katalog bersama.',",
    "    routeHome: 'Beranda',",
    "    routeAbout: 'Tentang',",
    '  },',
    '})',
    '',
    '// Human language names, kept separate from UI strings but still id/en.',
    "export const localeLabels: Record<Locale, string> = { id: 'Bahasa Indonesia', en: 'English' }",
    '',
    'export function toLocale(value: string): Locale | undefined {',
    '  return SUPPORTED_LOCALES.find((code) => code === value)',
    '}',
    '',
    'export function copy(locale: Locale, key: AppCopyKey): string {',
    '  return getLocaleMessage(appCopy, locale, key)',
    '}',
    '',
    'export function resolveInitialLocale(storedLocale: unknown, acceptLanguage?: string): Locale {',
    '  const resolution = resolveLocale({ persistedLocale: storedLocale, acceptLanguage })',
    "  return 'locale' in resolution ? resolution.locale : DEFAULT_LOCALE",
    '}',
    '',
  ].join('\n')

  const routerSource = [
    `// ${slug} routing scaffold — one locale-prefixed route table, no backend wiring.`,
    "import { isLocale, type Locale } from '@moonwitness/core'",
    '',
    "export type RouteKey = 'home' | 'about'",
    '',
    'export interface RouteDefinition {',
    '  readonly key: RouteKey',
    '  readonly path: string',
    "  readonly labelKey: 'routeHome' | 'routeAbout'",
    '}',
    '',
    'export const ROUTES: readonly RouteDefinition[] = [',
    "  { key: 'home', path: '/', labelKey: 'routeHome' },",
    "  { key: 'about', path: '/about', labelKey: 'routeAbout' },",
    ']',
    '',
    'export function localizedPath(locale: Locale, path: string): string {',
    "  return '/' + locale + (path === '/' ? '' : path)",
    '}',
    '',
    '// Parse a locale-prefixed route; unsupported locales/routes yield null.',
    'export function matchRoute(pathname: string): { locale: Locale; route: RouteDefinition } | null {',
    "  const segments = pathname.split('/').filter((segment) => segment !== '')",
    '  const locale = segments[0]',
    '  if (!isLocale(locale)) return null',
    "  const suffix = segments.length <= 1 ? '/' : '/' + segments.slice(1).join('/')",
    '  const route = ROUTES.find((candidate) => candidate.path === suffix)',
    '  return route === undefined ? null : { locale, route }',
    '}',
    '',
  ].join('\n')

  const selectorSource = [
    "import { SUPPORTED_LOCALES, type Locale } from '@moonwitness/core'",
    "import { SelectInput } from '@moonwitness/moonui'",
    "import { copy, localeLabels, toLocale } from '../locale.js'",
    "import type { ReactNode } from 'react'",
    '',
    '// id/en selector: labels come from the shared catalog; the choice persists',
    "// to localStorage and drives the app. aria-label keeps it accessible.",
    'export function LocaleSelector({',
    '  locale,',
    '  onChange,',
    '}: {',
    '  locale: Locale',
    '  onChange: (next: Locale) => void',
    '}): ReactNode {',
    '  return (',
    '    <SelectInput',
    "      aria-label={copy(locale, 'languageLabel')}",
    '      value={locale}',
    '      options={SUPPORTED_LOCALES.map((code) => ({ value: code, label: localeLabels[code] }))}',
    '      onChange={(event) => {',
    '        const next = toLocale(event.target.value)',
    '        if (next !== undefined) {',
    '          try {',
    "            window.localStorage.setItem('mw_locale', next)",
    '          } catch {',
    '            // Storage blocked: the session still switches via component state.',
    '          }',
    '          onChange(next)',
    '        }',
    '      }}',
    '    />',
    '  )',
    '}',
    '',
  ].join('\n')

  const routerTestSource = [
    "import assert from 'node:assert/strict'",
    "import test from 'node:test'",
    "import { localizedPath, matchRoute } from '../src/router.js'",
    '',
    "test('locale-prefixed routes match supported locales and reject unknown paths', () => {",
    "  assert.deepEqual(matchRoute('/id'), { locale: 'id', route: { key: 'home', path: '/', labelKey: 'routeHome' } })",
    "  assert.deepEqual(matchRoute('/en/about'), { locale: 'en', route: { key: 'about', path: '/about', labelKey: 'routeAbout' } })",
    "  assert.equal(matchRoute('/fr/about'), null)",
    "  assert.equal(matchRoute('/id/missing'), null)",
    "  assert.equal(localizedPath('id', '/about'), '/id/about')",
    '})',
    '',
  ].join('\n')

  const appSource = [
    "import { useEffect, useState, type ReactNode } from 'react'",
    "import type { Locale } from '@moonwitness/core'",
    "import { Button, PageHeader, Panel } from '@moonwitness/moonui'",
    "import { ROUTES, localizedPath, matchRoute } from './router.js'",
    "import { copy, resolveInitialLocale, type AppCopyKey } from './locale.js'",
    "import { LocaleSelector } from './components/LocaleSelector.js'",
    '',
    'export function App(): ReactNode {',
    '  const [locale, setLocale] = useState<Locale>(() => {',
    '    let storedLocale: string | undefined',
    '    try {',
    "      storedLocale = typeof window === 'undefined' ? undefined : window.localStorage.getItem('mw_locale') ?? undefined",
    '    } catch {',
    '      storedLocale = undefined',
    '    }',
    "    return resolveInitialLocale(storedLocale, typeof window === 'undefined' ? undefined : window.navigator.language)",
    '  })',
    "  const initialRoute = typeof window === 'undefined' ? null : matchRoute(window.location.pathname)",
    "  const [routeKey, setRouteKey] = useState<'home' | 'about'>(initialRoute?.route.key ?? 'home')",
    '',
    '  useEffect(() => {',
    "    if (typeof window === 'undefined') return",
    '    const syncLocation = () => {',
    '      const matched = matchRoute(window.location.pathname)',
    '      setLocale(matched?.locale ?? resolveInitialLocale(undefined, window.navigator.language))',
    "      setRouteKey(matched?.route.key ?? 'home')",
    '    }',
    "    window.addEventListener('popstate', syncLocation)",
    "    return () => window.removeEventListener('popstate', syncLocation)",
    '  }, [])',
    '',
    '  const navigate = (path: string) => {',
    '    const nextPath = localizedPath(locale, path)',
    "    window.history.pushState({}, '', nextPath)",
    '    const matched = matchRoute(nextPath)',
    '    if (matched !== null) {',
    '      setLocale(matched.locale)',
    '      setRouteKey(matched.route.key)',
    '    }',
    '  }',
    '',
    "  const headingKey: AppCopyKey = routeKey === 'home' ? 'homeHeading' : 'aboutHeading'",
    "  const bodyKey: AppCopyKey = routeKey === 'home' ? 'homeBody' : 'aboutBody'",
    '',
    '  return (',
    '    <div className="app-shell">',
    '      <PageHeader',
    "        title={copy(locale, 'appTitle')}",
    "        subtitle={copy(locale, 'appSubtitle')}",
    '        actions={<LocaleSelector locale={locale} onChange={(nextLocale) => {',
    '          const nextPath = localizedPath(nextLocale, window.location.pathname.replace(/^\\/(id|en)/, \'\') || \'/\')',
    "          window.history.pushState({}, '', nextPath)",
    '          setLocale(nextLocale)',
    '        }} />}',
    '      />',
    "      <nav aria-label={copy(locale, 'navigationLabel')}>",
    '        {ROUTES.map((route) => (',
    '          <Button',
    '            key={route.key}',
    "            variant={route.key === routeKey ? 'primary' : 'ghost'}",
    "            aria-current={route.key === routeKey ? 'page' : undefined}",
    '            onClick={() => navigate(route.path)}',
    '          >',
    '            {copy(locale, route.labelKey)}',
    '          </Button>',
    '        ))}',
    '      </nav>',
    '      <Panel title={copy(locale, headingKey)}>',
    '        <p>{copy(locale, bodyKey)}</p>',
    '      </Panel>',
    '    </div>',
    '  )',
    '}',
    '',
  ].join('\n')

  const mainSource = [
    "import { createRoot } from 'react-dom/client'",
    "import '@moonwitness/moonui/moon.css'",
    "import { App } from './App.js'",
    '',
    "const rootElement = document.getElementById('root')",
    'if (rootElement !== null) {',
    '  createRoot(rootElement).render(<App />)',
    '}',
    '',
  ].join('\n')

  const readme = [
    `# @moonwitness/${slug}`,
    '',
    'Generated by the App Factory (`pnpm app:create --variant frontend`, M05-18/M05-19).',
    '',
    '- Inherits the shared i18n contract from `@moonwitness/core` (id/en catalog, no second i18n engine).',
    '- Inherits the shared design system from `@moonwitness/moonui` (PageHeader/Panel/Button/SelectInput).',
    '- Ships a working id/en locale selector, a locale-prefixed routing scaffold and accessibility labels.',
    '- Private internal app: no fabricated public port, no database, no second Hub, no Docker/Compose wiring.',
    `- Scripts: \`pnpm --filter @moonwitness/${slug} typecheck\` (tsc --noEmit), \`build\` (vite build), \`lint\`.`,
    `- Rollback before integration: delete \`apps/${slug}\`; the factory never rewrites an existing directory.`,
    '',
  ].join('\n')

  const base = ['apps', slug]
  return [
    { relPath: join(...base, 'package.json'), content: `${JSON.stringify(packageManifest, null, 2)}\n` },
    { relPath: join(...base, 'tsconfig.json'), content: `${JSON.stringify(tsconfig, null, 2)}\n` },
    { relPath: join(...base, 'vite.config.ts'), content: `${viteConfig}\n` },
    { relPath: join(...base, 'index.html'), content: `${indexHtml}\n` },
    { relPath: join(...base, 'README.md'), content: `${readme}\n` },
    { relPath: join(...base, 'src', 'vite-env.d.ts'), content: `${viteEnv}\n` },
    { relPath: join(...base, 'src', 'locale.ts'), content: `${localeSource}\n` },
    { relPath: join(...base, 'src', 'router.ts'), content: `${routerSource}\n` },
    { relPath: join(...base, 'test', 'router.test.ts'), content: `${routerTestSource}\n` },
    { relPath: join(...base, 'src', 'App.tsx'), content: `${appSource}\n` },
    { relPath: join(...base, 'src', 'main.tsx'), content: `${mainSource}\n` },
    { relPath: join(...base, 'src', 'components', 'LocaleSelector.tsx'), content: `${selectorSource}\n` },
  ]
}

function parseFactoryArgs(args) {
  const options = { slug: undefined, variant: 'worker', dryRun: false, help: false }
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--dry-run' || argument === '--dryrun') options.dryRun = true
    else if (argument === '--help' || argument === '-h') options.help = true
    else if (argument === '--variant') {
      const value = args[index + 1]
      if (value === undefined || value.startsWith('--')) return { error: 'unknownOption', value: '--variant' }
      options.variant = value
      index += 1
    } else if (argument.startsWith('--variant=')) options.variant = argument.slice('--variant='.length)
    else if (argument.startsWith('-')) return { error: 'unknownOption', value: argument }
    else if (options.slug === undefined) options.slug = argument
    else return { error: 'unknownOption', value: argument }
  }
  return { options }
}

function usageText(locale) {
  const lines = [
    factoryMessage(locale, 'usage'),
    '',
    factoryMessage(locale, 'variantsHeading'),
    factoryMessage(locale, 'variantWorker'),
    factoryMessage(locale, 'variantFrontend'),
    '',
    factoryMessage(locale, 'optionsHeading'),
    factoryMessage(locale, 'variantOption'),
    factoryMessage(locale, 'dryRunOption'),
    factoryMessage(locale, 'localeOption'),
    factoryMessage(locale, 'helpOption'),
  ]
  return `${lines.join('\n')}\n`
}

/**
 * Run the factory once. Pure with respect to the process: everything is
 * injected, so tests can point it at a temporary root and capture output.
 * Returns the numeric exit code; performs no writes when it returns non-zero.
 */
export function runAppCreate({
  argv,
  root = repoRoot,
  env = process.env,
  stdout = (line) => process.stdout.write(`${line}\n`),
  stderr = (line) => process.stderr.write(`${line}\n`),
} = {}) {
  const localeResult = resolveFactoryLocale(argv, env.MW_LOCALE)
  if (!localeResult.ok) {
    const key = localeResult.error === 'missing' ? 'localeMissing' : 'localeInvalid'
    stderr(factoryMessage(localeResult.locale, key, { locale: localeResult.value ?? '' }))
    return 1
  }
  const { locale, args } = localeResult

  const parsed = parseFactoryArgs(args)
  if (parsed.error) {
    stderr(factoryMessage(locale, 'refusedUnknownOption', { option: parsed.value }))
    return 1
  }
  const { options } = parsed
  if (options.help) {
    stdout(usageText(locale))
    return 0
  }

  const slugResult = validateAppSlug(options.slug)
  if (!slugResult.ok) {
    if (slugResult.reason === 'missingSlug') stderr(factoryMessage(locale, 'refusedMissingSlug', { usage: factoryMessage(locale, 'usage') }))
    else if (slugResult.reason === 'traversal') stderr(factoryMessage(locale, 'refusedTraversal', { slug: slugResult.value }))
    else if (slugResult.reason === 'reserved') stderr(factoryMessage(locale, 'refusedReserved', { slug: slugResult.value }))
    else if (slugResult.reason === 'length') stderr(factoryMessage(locale, 'refusedLength', { slug: slugResult.value, min: SLUG_MIN_LENGTH, max: SLUG_MAX_LENGTH }))
    else stderr(factoryMessage(locale, 'refusedInvalid', { slug: slugResult.value, min: SLUG_MIN_LENGTH, max: SLUG_MAX_LENGTH }))
    return 1
  }
  const slug = options.slug

  if (!Object.hasOwn(VARIANTS, options.variant)) {
    stderr(factoryMessage(locale, 'refusedUnknownVariant', { variant: options.variant, variants: Object.keys(VARIANTS).join(', ') }))
    return 1
  }
  if (!VARIANTS[options.variant].implemented) {
    stderr(factoryMessage(locale, 'refusedVariantPlanned', { variant: options.variant }))
    return 1
  }

  const appsDir = join(root, 'apps')
  if (!existsSync(appsDir)) {
    stderr(factoryMessage(locale, 'refusedMissingAppsDir', { root }))
    return 1
  }

  let target
  try {
    target = resolveTargetPath(root, slug)
  } catch {
    stderr(factoryMessage(locale, 'refusedTraversal', { slug }))
    return 1
  }
  if (existsSync(target)) {
    stderr(factoryMessage(locale, 'refusedExists', { dir: target }))
    return 1
  }

  const plan = planFiles(slug, options.variant)
  const heading = options.dryRun
    ? factoryMessage(locale, 'dryRunHeading')
    : factoryMessage(locale, 'writeHeading')
  stdout(heading)
  for (const file of plan) stdout(factoryMessage(locale, 'fileLine', { path: join(root, file.relPath) }))

  if (options.dryRun) return 0

  // Re-check every planned path before the first write (collision-safe even
  // against partial leftovers inside an otherwise-absent app directory).
  for (const file of plan) {
    const planned = join(root, file.relPath)
    if (existsSync(planned)) {
      stderr(factoryMessage(locale, 'refusedExistingFile', { path: planned }))
      return 1
    }
  }

  const createdFiles = []
  let targetCreated = false
  try {
    mkdirSync(target, { recursive: false })
    targetCreated = true
    for (const file of plan) {
      const dest = join(root, file.relPath)
      mkdirSync(dirname(dest), { recursive: true })
      const descriptor = openSync(dest, 'wx')
      try {
        createdFiles.push({ dest, identity: fstatSync(descriptor) })
        writeFileSync(descriptor, file.content, 'utf8')
      } finally {
        closeSync(descriptor)
      }
    }
  } catch (error) {
    for (const created of createdFiles.reverse()) {
      try {
        const current = lstatSync(created.dest)
        if (current.dev === created.identity.dev && current.ino === created.identity.ino) unlinkSync(created.dest)
      } catch {
        // A file already removed/replaced by another process is not ours to clean up.
      }
    }
    if (targetCreated) {
      const directories = [...new Set(createdFiles.map(({ dest }) => dirname(dest)))]
        .sort((left, right) => right.length - left.length)
      for (const directory of [...directories, target]) {
        try {
          rmdirSync(directory)
        } catch {
          // Keep non-empty directories; they may contain concurrent user data.
        }
      }
    }
    stderr(`${factoryMessage(locale, 'refusedExists', { dir: target })} (${error instanceof Error ? error.message : String(error)})`)
    return 1
  }
  stdout(factoryMessage(locale, 'created', { count: plan.length, dir: target }))
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runAppCreate({ argv: process.argv.slice(2) })
}
