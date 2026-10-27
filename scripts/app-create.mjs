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
 * Deliberate scope limits: the `frontend` variant (i18n + MoonUI inheritance)
 * lands in M05-19 and the worker process/health configuration in M05-20; this
 * task ships the safe CLI shell, validation, dry-run and collision refusal
 * only. Generated entry points are inert placeholders and never fabricate a UI.
 *
 * Locale stance (M05-10/M05-23): human-facing output uses an id/en catalog with
 * stable message keys, selected by `--locale id|en`, then a valid `MW_LOCALE`,
 * then the `en` default; an invalid explicit locale exits 1 with a message in
 * the available locale. `scripts/*.mjs` stay plain JS with no package
 * dependencies, so this catalog is self-contained here and mirrors the shared
 * CLI's selection contract (the canonical operator catalog lives in
 * packages/cli/src/locale.ts).
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
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
  frontend: { implemented: false, ownerNote: 'M05-19 adds i18n + MoonUI inheritance' },
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
    variantFrontend: 'frontend  Planned by M05-19 (i18n + MoonUI inheritance); not implemented yet.',
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
    variantFrontend: 'frontend  Direncanakan pada M05-19 ( Pewarisan i18n + MoonUI); belum diimplementasikan.',
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
  const packageManifest = {
    name: `@moonwitness/${slug}`,
    version: '0.1.0',
    private: true,
    type: 'module',
    description: `MoonWitness XV workspace app ${slug} (${variant}, generated by the App Factory).`,
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
    references: [{ path: '../../packages/core' }],
  }

  const entrySource = [
    `// ${slug} — generated by the App Factory (scripts/app-create.mjs, M05-18).`,
    '// Inert placeholder on purpose: no UI (M05-19 owns frontend/i18n), no port,',
    '// no health config or database (M05-20 owns worker/service configuration).',
    '// M05-17 forbids a new data owner, second Hub, or public port by default.',
    'export async function main(): Promise<void> {',
    '  await Promise.resolve()',
    '}',
    '',
  ].join('\n')

  const readme = [
    `# @moonwitness/${slug}`,
    '',
    'Generated by the App Factory (`pnpm app:create`, M05-18). Variant: ' + variant + '.',
    '',
    '- Private internal workspace app: no UI, no public port, no database.',
    '- Next owners: M05-19 (frontend i18n/MoonUI), M05-20 (worker process/health), M05-21 (integration).',
    `- Rollback before integration: delete \`apps/${slug}\`; the factory never rewrites an existing directory.`,
    '',
  ].join('\n')

  return [
    { relPath: join('apps', slug, 'package.json'), content: `${JSON.stringify(packageManifest, null, 2)}\n` },
    { relPath: join('apps', slug, 'tsconfig.json'), content: `${JSON.stringify(tsconfig, null, 2)}\n` },
    { relPath: join('apps', slug, 'src', 'index.ts'), content: `${entrySource}\n` },
    { relPath: join('apps', slug, 'README.md'), content: `${readme}\n` },
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

  try {
    mkdirSync(target, { recursive: false })
    mkdirSync(join(target, 'src'), { recursive: false })
    for (const file of plan) writeFileSync(join(root, file.relPath), file.content, 'utf8')
  } catch (error) {
    stderr(`${factoryMessage(locale, 'refusedExists', { dir: target })} (${error instanceof Error ? error.message : String(error)})`)
    return 1
  }
  stdout(factoryMessage(locale, 'created', { count: plan.length, dir: target }))
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = runAppCreate({ argv: process.argv.slice(2) })
}
