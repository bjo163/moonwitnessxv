// Konfigurasi lint tunggal untuk seluruh workspace.
//
// Repo ini tidak punya formatter dan memang tidak seharusnya butuh: yang
// dijaga di sini adalah aturan arsitektur yang selama ini hanya hidup sebagai
// komentar ("addons tidak menyentuh fastify", "core harus web-safe",
// "semua cast drizzle terkurung di satu berkas"). Komentar itu tidak pernah
// ditegakkan, jadi ia melunak. Aturan di bawah menegakkannya, dan karena
// `pnpm verify` memanggil `pnpm lint`, melanggarnya sekarang menghentikan build.
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'

// Berkas yang bukan sumber yang ditulis tangan: hasil build, kodegen, atau
// perkakas internal. generated.ts sengaja tidak dilintasi — ia ditulis ulang
// oleh `pnpm gen:sdk`, jadi setiap "perbaikan" di sana akan hilang.
const GLOBAL_IGNORES = [
  'node_modules/**',
  '**/node_modules/**',
  '**/dist/**',
  '**/.next/**',
  '**/*.tsbuildinfo',
  'packages/moonql/drizzle/meta/**',
  'packages/moonql-client/src/generated.ts',
  '**/next-env.d.ts',
  '**/.next/types/**',
  'coverage/**',
  '**/public/**',
]

/** Aturan yang sama untuk semua berkas TypeScript di apps dan packages. */
const typescriptRules = {
  ...tseslint.configs.recommendedTypeChecked.rules,

  // `any` adalah lubang tipe, bukan gaya. Yang tersisa setelah tahap ini hanya
  // batas drizzle di packages/moonql/src/drizzle-io.ts, dengan alasan per baris.
  '@typescript-eslint/no-explicit-any': 'error',

  // Api key di header, token di cookie, stream di socket: semuanya jalur yang
  // sunyi. Promise yang menguang tanpa ditangkap tidak pernah dilaporkan ke siapa pun.
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',

  // `disallowTypeAnnotations: false` karena `import('drizzle-orm/pg-core').AnyPgTable`
  // di posisi tipe adalah cara sadar untuk tidak menarik modul ke runtime
  // (kontrak tipenya yang dipakai, bukan koneksinya).
  '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: false }],
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],

  // `!` adalah janji ke pembaca; kalau salah, yang gagal adalah produksi. Naik ke
  // error setelah sisanya bersih (lihat rencana M0, tahap ratchet).
  '@typescript-eslint/no-non-null-assertion': 'warn',

  // Diperkirakan off: aturannya menuntut program type-checked penuh untuk kedua
  // app Next, dan hasilnya sebagian besar adalah cast berulang yang justru
  // mengundang `any` baru.
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
}

export default tseslint.config(
  { ignores: GLOBAL_IGNORES },

  eslint.configs.recommended,

  // ---------------------------------------------------------------- TypeScript
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      // Parser-nya harus eksplisit: aturan type-checked menolak berjalan di atas
      // parser default espree, dan pesan galahnya tidak menyebut hal itu.
      parser: tseslint.parser,
      parserOptions: {
        // Satu proyek untuk semua berkas TypeScript: `apps/radio/test` punya
        // tsconfig sendiri (noEmit) supaya tes dapat diperiksa type-aware tanpa
        // ikut ter-emit ke image produksi.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      ...typescriptRules,
      // Dua aturan dasar ini selalu salah di berkas TypeScript: yang pertama
      // melaporkan ulang apa yang sudah handled oleh varian @typescript-eslint,
      // yang kedua menganggap setiap nama global (dan setiap tipe) tak terdefinisi
      // karena TS sendiri yang menyelesaikan nama global dan tipe. Dimatikan untuk
      // TS, tetap aktif untuk JS.
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },

  // ------------------------------------------------------ React (kedua app Next)
  {
    files: ['apps/dock/**/*.tsx', 'apps/headquarters/**/*.tsx', 'packages/moonui/**/*.tsx'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      // Dependency array yang hilang adalah cara halus untuk membuat state basi;
      // yang lama memang sengaja di-exhaustive-kan, jadi ini peringatan dulu.
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // ------------------------------------------------- Aturan arsitektur per area
  //
  // Hanya `moonql` yang boleh menyentuh drizzle/postgres: itulah alasan ORM ini
  // ada — addon dan app mendeklarasikan data, bukan membangun SQL.
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/moonql-*/**/*.{ts,tsx}', 'packages/denpa/**/*.{ts,tsx}', 'packages/whatsapp/**/*.{ts,tsx}'],
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

  // `core` ikut ter-bundle ke browser; built-in node adalah lubang runtime, bukan
  // sekadar gaya. Yang butuh crypto sungguhan (hash, scrypt) tinggal di pemiliknya.
  {
    files: ['packages/core/src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['node:*', 'fs', 'path', 'crypto', 'os', 'http'], message: '@moonwitness/core harus web-safe: tidak ada built-in Node' }] }],
    },
  },

  // crypto hanya di tempat yang memang memegang rahasia; daftar ini pendek dan
  // disengaja — menambah satu berkas berarti menjelaskan alasannya di sini.
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/moonql-client/**/*.{ts,tsx}', 'packages/moonui/**/*.{ts,tsx}', 'packages/moonql-base/**/*.{ts,tsx}', 'packages/moonql-settings/**/*.{ts,tsx}', 'packages/moonql-schedule/**/*.{ts,tsx}', 'packages/moonql-stations/**/*.{ts,tsx}', 'packages/moonql-ops/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['node:crypto'], message: 'hash/pseudonym adalah hak milik modul yang menyimpan hasilnya (lihat moonql-auth, moonql-apikeys, moonql-playlog)' }] }],
    },
  },

  // ------------------------------------------------------------------- Skrip JS
  {
    files: ['scripts/**/*.mjs', 'apps/*/next.config.mjs', 'apps/radio/src/tools/**/*.ts', '*.config.mjs', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      // Skrip Node: tidak ada tsconfig di belakangnya, jadi daftar global ditulis
      // tangan daripada menarik paket `globals` hanya untuk empat nama.
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', TextEncoder: 'readonly', fetch: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly' },
    },
    rules: { 'no-console': 'off' },
  },

  // Alat baris perintah: stdout adalah produknya, jadi `console.log` bukan
  // kekurangan di sini.
  {
    files: ['apps/radio/src/tools/**/*.ts'],
    rules: { 'no-console': 'off' },
  },

  // Berkas konfigurasi yang tidak termasuk proyek TypeScript mana pun: dilintasi
  // tanpa informasi tipe (aturannya butuh `parserOptions.project`, dan menambah
  // satu tsconfig hanya untuk `drizzle.config.ts` adalah ritual kosong).
  {
    files: ['**/drizzle.config.ts', '**/*.config.mjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  // -------------------------------------------------------------------- Tes
  {
    files: ['apps/radio/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
      // `test('...', async (t) => {...})` dilaporkan sebagai promise yang mengambang
      // karena `TestFn` di @types/node mendeklarasikan hasilnya `void` padahal
      // runner benar-benar menunggu `Promise`-nya. Menandai 150+ panggilan dengan
      // `void` akan menyembunyikan sinyal asli; yang nyata di sini adalah assertion
      // yang gagal = tes yang gagal.
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
)
