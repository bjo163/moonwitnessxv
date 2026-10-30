import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const DEFAULT_MATRIX = fileURLToPath(new URL('../docs/research/mwx-isp-into-xv-migration-matrix.md', import.meta.url))
const SOURCE_SHA = 'ab8a512b468c4a9b979418f8b05720a58651ebfe'
const EXPECTED_IDS = [
  ...Array.from({ length: 24 }, (_, index) => `TR-F${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 8 }, (_, index) => `TR-F${String(index + 26).padStart(3, '0')}`),
]

export function validateMatrix(markdown) {
  if (!markdown.includes(SOURCE_SHA)) throw new Error(`missing pinned source SHA ${SOURCE_SHA}`)
  const rows = [...markdown.matchAll(/^\|\s*(TR-F\d{3})\b[^|]*\|\s*([^|]+)\|\s*([^|]+)\|/gm)]
  const ids = rows.map((row) => row[1])
  const unique = new Set(ids)
  const duplicate = ids.find((id, index) => ids.indexOf(id) !== index)
  if (duplicate) throw new Error(`duplicate feature ID ${duplicate}`)
  const unexpected = ids.find((id) => !EXPECTED_IDS.includes(id))
  if (unexpected) throw new Error(`unexpected source feature ID ${unexpected}`)
  const missing = EXPECTED_IDS.filter((id) => !unique.has(id))
  if (missing.length) throw new Error(`missing source feature IDs: ${missing.join(', ')}`)
  if (rows.some((row) => !row[2].trim() || !row[3].trim())) throw new Error('every feature row needs an owner and migration decision')
  if (!markdown.includes('TR-F025 is absent')) throw new Error('source gap TR-F025 must remain explicit')

  const rowFor = (id) => rows.find((row) => row[1] === id)?.[0] ?? ''
  if (!rowFor('TR-F017').includes('MoonQL / ARSY') || !rowFor('TR-F017').includes('SQLite')) {
    throw new Error('TR-F017 must map persistence to MoonQL/ARSY and exclude SQLite')
  }
  if (!rowFor('TR-F030').includes('D18 / SKYLINK')) throw new Error('TR-F030 must use the accepted D18/SKYLINK owner')
  return ids.length
}

async function main() {
  const inputIndex = process.argv.indexOf('--input')
  const input = inputIndex >= 0 ? path.resolve(process.argv[inputIndex + 1] ?? '') : DEFAULT_MATRIX
  const markdown = await readFile(input, 'utf8')
  const count = validateMatrix(markdown)
  process.stdout.write(`MWX-ISP migration matrix valid: ${count} feature IDs; source ${SOURCE_SHA}.\n`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`MWX-ISP migration matrix invalid: ${error instanceof Error ? error.message : 'unknown error'}\n`)
    process.exitCode = 1
  })
}
