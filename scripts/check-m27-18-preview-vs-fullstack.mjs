#!/usr/bin/env node
/**
 * scripts/check-m27-18-preview-vs-fullstack.mjs
 *
 * M27-18 contract validator (dependency-free).
 *
 * Proves that docs/planning/M27-18-preview-vs-fullstack.md defines two
 * separate acceptance gates and that their machine-readable manifest agrees
 * with the prose:
 *   1. Both gate sections, their entry/evidence/claim subsections, and the
 *      manifest markers exist exactly once.
 *   2. The PREVIEW gate requires only the preview evidence subset, requires an
 *      exact SHA, and claims no production deployment or release acceptance.
 *   3. The FULL-STACK gate requires every full-stack evidence class, requires
 *      an exact SHA, and keeps deployment/acceptance conditional on observed
 *      evidence and the human go/no-go.
 *   4. Every evidence class is declared, preview evidence is a strict subset of
 *      full-stack evidence, and prose evidence bullets match the manifest.
 *   5. --self-test rejects tampered fixtures: a preview gate that claims
 *      production, a full-stack gate missing an evidence class, a gate without
 *      an exact-SHA requirement, prose that claims production, a missing
 *      manifest marker, and a missing preview evidence bullet.
 *
 * What this does not prove: that any gate was executed, that any deployment or
 * rights claim is true, or that CI passed. It reads one Markdown file only.
 * No network, no writes.
 *
 * Run:            node scripts/check-m27-18-preview-vs-fullstack.mjs
 * Negative test:  node scripts/check-m27-18-preview-vs-fullstack.mjs --self-test
 *
 * Exit 0 when clean, 1 on any violation.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_CONTRACT = 'docs/planning/M27-18-preview-vs-fullstack.md'

const BEGIN = '<!-- M27-18 CONTRACT MANIFEST BEGIN -->'
const END = '<!-- M27-18 CONTRACT MANIFEST END -->'
const GATE_HEADINGS = {
  PREVIEW: '## Gate P — PREVIEW acceptance',
  FULLSTACK: '## Gate F — FULL-STACK M27 acceptance',
}
const REQUIRED_ANCHORS = [
  BEGIN,
  END,
  GATE_HEADINGS.PREVIEW,
  '### P.1 Entry criteria',
  '### P.2 Required evidence artefacts',
  '### P.3 Claims and prohibitions',
  GATE_HEADINGS.FULLSTACK,
  '### F.1 Entry criteria',
  '### F.2 Required evidence artefacts',
  '### F.3 Claims and prohibitions',
]
const REQUIRED_PHRASES = [
  'preview acceptance does not imply production deployment',
  'exact 40-character SHA',
  'human go/no-go',
  'unshipped Empire modules',
  'cannot be promoted',
]
const REQUIRED_PREVIEW_EVIDENCE = ['EV-SHA', 'EV-MANIFEST', 'EV-BUILD', 'EV-BROWSER', 'EV-RIGHTS', 'EV-HUMAN']
const REQUIRED_FULLSTACK_EVIDENCE = [
  'EV-SHA',
  'EV-MANIFEST',
  'EV-BUILD',
  'EV-LINT-TYPECHECK',
  'EV-TESTS',
  'EV-SDK',
  'EV-PG',
  'EV-DOCKER',
  'EV-BROWSER',
  'EV-RESTORE',
  'EV-RIGHTS',
  'EV-ROLLBACK',
  'EV-HUMAN',
]
const PREVIEW_FORBIDDEN_CLAIM = /\bproduction\b|\bdeploy(?:ed|ment)?\b|DEPLOYED_VERIFIED|RELEASE_ACCEPTED/i
const FULLSTACK_REQUIRED_CLAIMS = ['DEPLOYED_VERIFIED', 'RELEASE_ACCEPTED']
const MIN_CLASS_DESCRIPTION = 30

function isFilled(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function sameSet(actual, expected) {
  if (!Array.isArray(actual) || actual.length !== expected.length) return false
  const a = [...actual].sort()
  const b = [...expected].sort()
  return a.every((value, index) => value === b[index])
}

function sectionBetween(text, startHeading, endHeading) {
  const start = text.indexOf(startHeading)
  if (start < 0) return ''
  const end = endHeading ? text.indexOf(endHeading, start + startHeading.length) : -1
  return end < 0 ? text.slice(start) : text.slice(start, end)
}

function gateProse(prose, key) {
  const own = GATE_HEADINGS[key]
  const other = key === 'PREVIEW' ? GATE_HEADINGS.FULLSTACK : GATE_HEADINGS.PREVIEW
  if (key === 'PREVIEW') return sectionBetween(prose, own, other)
  const start = prose.indexOf(own)
  if (start < 0) return ''
  const next = prose.indexOf('\n## ', start + own.length)
  return next < 0 ? prose.slice(start) : prose.slice(start, next)
}

function evidenceBullets(section) {
  const found = []
  const pattern = /^-\s+`(EV-[A-Z0-9-]+)`/gm
  let match
  while ((match = pattern.exec(section)) !== null) found.push(match[1])
  return found
}

function claimLine(section, label) {
  const pattern = new RegExp(`^-\\s+${label}:\\s*(.+)$`, 'm')
  const match = pattern.exec(section)
  return match ? match[1].trim() : null
}

function withoutManifest(text) {
  const begin = text.indexOf(BEGIN)
  const end = text.indexOf(END)
  if (begin < 0 || end < 0 || end < begin) return text
  return text.slice(0, begin) + text.slice(end + END.length)
}

function readManifest(text, fail) {
  const begin = text.indexOf(BEGIN)
  const end = text.indexOf(END)
  if (begin < 0 || end < 0 || end < begin) {
    fail('manifest marker is missing or out of order')
    return null
  }
  const block = text.slice(begin + BEGIN.length, end)
  const open = block.indexOf('{')
  const close = block.lastIndexOf('}')
  if (open < 0 || close < open) {
    fail('manifest block contains no JSON object')
    return null
  }
  try {
    return JSON.parse(block.slice(open, close + 1))
  } catch (error) {
    fail(`manifest JSON is not parseable: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

function validate(text) {
  const errors = []
  const fail = (message) => errors.push(message)
  const prose = withoutManifest(text)

  for (const anchor of REQUIRED_ANCHORS) {
    const scope = anchor === BEGIN || anchor === END ? text : prose
    const count = scope.split(anchor).length - 1
    if (count !== 1) fail(`required anchor ${JSON.stringify(anchor)} occurs ${count} time(s), expected exactly 1`)
  }
  for (const phrase of REQUIRED_PHRASES) {
    if (!prose.toLowerCase().includes(phrase.toLowerCase())) {
      fail(`required phrase ${JSON.stringify(phrase)} is missing from the prose`)
    }
  }

  const manifest = readManifest(text, fail)
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    if (manifest !== null) fail('manifest is not a JSON object')
    return { errors, summary: null }
  }
  if (manifest.schema !== 'moonwitness-m27-18-release-acceptance/1') {
    fail(`schema ${JSON.stringify(manifest.schema)} is not the M27-18 contract schema`)
  }
  if (manifest.task !== 'M27-18') fail(`task ${JSON.stringify(manifest.task)} !== "M27-18"`)
  if (manifest.sha_length !== 40) fail(`sha_length ${JSON.stringify(manifest.sha_length)} !== 40`)

  const gates = manifest.gates
  if (!gates || typeof gates !== 'object' || Array.isArray(gates)) {
    fail('manifest.gates is missing')
    return { errors, summary: null }
  }
  const gateKeys = Object.keys(gates).sort()
  if (gateKeys.join(',') !== 'FULLSTACK,PREVIEW') {
    fail(`manifest.gates must contain exactly PREVIEW and FULLSTACK, found ${gateKeys.join(',') || '(none)'}`)
  }

  const classes = manifest.evidence_classes
  if (!classes || typeof classes !== 'object' || Array.isArray(classes)) {
    fail('manifest.evidence_classes is missing')
  } else {
    const classKeys = Object.keys(classes).sort()
    if (classKeys.join(',') !== [...REQUIRED_FULLSTACK_EVIDENCE].sort().join(',')) {
      fail('evidence_classes must declare exactly the full-stack evidence vocabulary')
    }
    for (const [code, description] of Object.entries(classes)) {
      if (!isFilled(description) || description.trim().length < MIN_CLASS_DESCRIPTION) {
        fail(`evidence class ${code} needs a description of at least ${MIN_CLASS_DESCRIPTION} characters`)
      }
    }
  }

  const summary = {}
  for (const key of ['PREVIEW', 'FULLSTACK']) {
    const gate = gates[key]
    if (!gate || typeof gate !== 'object' || Array.isArray(gate)) {
      fail(`${key} gate is missing`)
      continue
    }
    const expectedEvidence = key === 'PREVIEW' ? REQUIRED_PREVIEW_EVIDENCE : REQUIRED_FULLSTACK_EVIDENCE
    const where = key === 'PREVIEW' ? 'preview' : 'full-stack'

    if (gate.heading !== GATE_HEADINGS[key]) {
      fail(`${key} gate heading ${JSON.stringify(gate.heading)} does not match ${JSON.stringify(GATE_HEADINGS[key])}`)
    }
    if (gate.exact_sha_required !== true) {
      fail(`${key} gate has no exact-SHA requirement; every gate must require the exact SHA`)
    }
    if (!sameSet(gate.required_evidence, expectedEvidence)) {
      if (key === 'FULLSTACK') {
        for (const code of expectedEvidence) {
          if (!Array.isArray(gate.required_evidence) || !gate.required_evidence.includes(code)) {
            fail(`missing full-stack evidence class ${code}`)
          }
        }
        if (Array.isArray(gate.required_evidence)) {
          for (const code of gate.required_evidence) {
            if (!expectedEvidence.includes(code)) fail(`unknown full-stack evidence class ${code}`)
          }
        }
      } else {
        fail(`preview evidence classes must be exactly ${expectedEvidence.join(', ')}`)
      }
    }
    if (Array.isArray(gate.required_evidence) && new Set(gate.required_evidence).size !== gate.required_evidence.length) {
      fail(`${key} gate repeats an evidence class`)
    }
    if (Array.isArray(gate.required_evidence) && classes) {
      for (const code of gate.required_evidence) {
        if (!Object.prototype.hasOwnProperty.call(classes, code)) {
          fail(`${key} gate requires undeclared evidence class ${code}`)
        }
      }
    }

    const mayClaim = Array.isArray(gate.may_claim) ? gate.may_claim.filter(isFilled) : []
    const mustNotClaim = Array.isArray(gate.must_not_claim) ? gate.must_not_claim.filter(isFilled) : []
    if (mayClaim.length === 0) fail(`${key} gate declares no may_claim entries`)
    if (mustNotClaim.length === 0) fail(`${key} gate declares no must_not_claim entries`)

    const section = gateProse(prose, key)
    if (!section) {
      fail(`${key} gate section is missing from the prose`)
    } else {
      const listed = evidenceBullets(section)
      for (const code of expectedEvidence) {
        if (!listed.includes(code)) fail(`${where} section does not list required evidence ${code}`)
      }
      for (const code of listed) {
        if (!expectedEvidence.includes(code)) fail(`${where} section lists ${code}, which its gate does not declare`)
      }
      const proseMayClaim = claimLine(section, 'MAY CLAIM')
      const proseMustNotClaim = claimLine(section, 'MUST NOT CLAIM')
      if (!proseMayClaim) fail(`${where} section has no "- MAY CLAIM:" line`)
      if (!proseMustNotClaim) fail(`${where} section has no "- MUST NOT CLAIM:" line`)
      if (proseMayClaim && PREVIEW_FORBIDDEN_CLAIM.test(proseMayClaim)) {
        if (key === 'PREVIEW') fail('preview gate must not claim production, deployment or release acceptance')
      }
    }

    if (key === 'PREVIEW') {
      if (gate.production_claim !== false) fail('preview gate must not claim production')
      if (gate.deployment_claim !== 'preview-only' && gate.deployment_claim !== false) {
        fail('preview gate deployment_claim must be "preview-only" or false')
      }
      for (const claim of mayClaim) {
        if (PREVIEW_FORBIDDEN_CLAIM.test(claim)) {
          fail(`preview gate must not claim production: ${JSON.stringify(claim)}`)
        }
      }
      if (!mustNotClaim.some((claim) => /production/i.test(claim))) {
        fail('preview gate must explicitly forbid a production claim')
      }
    } else {
      if (gate.production_claim !== true) fail('full-stack gate must reach a production claim')
      if (gate.deployment_claim !== 'observed-only') {
        fail('full-stack gate deployment_claim must be "observed-only"')
      }
      const joined = mayClaim.join(' | ')
      for (const required of FULLSTACK_REQUIRED_CLAIMS) {
        if (!joined.includes(required)) fail(`full-stack gate may_claim omits ${required}`)
      }
    }

    summary[key] = {
      evidence: Array.isArray(gate.required_evidence) ? gate.required_evidence.length : 0,
      mayClaim: mayClaim.length,
      mustNotClaim: mustNotClaim.length,
    }
  }

  const preview = gates.PREVIEW
  const fullstack = gates.FULLSTACK
  if (preview && fullstack && Array.isArray(preview.required_evidence) && Array.isArray(fullstack.required_evidence)) {
    for (const code of preview.required_evidence) {
      if (!fullstack.required_evidence.includes(code)) {
        fail(`preview evidence ${code} is not part of the full-stack evidence matrix`)
      }
    }
    if (preview.required_evidence.length >= fullstack.required_evidence.length) {
      fail('preview evidence must be a strict subset of full-stack evidence')
    }
  }

  return { errors, summary }
}

function loadContract(path) {
  return readFileSync(resolve(ROOT, path), 'utf8')
}

function replaceManifest(text, mutate) {
  const begin = text.indexOf(BEGIN)
  const end = text.indexOf(END)
  if (begin < 0 || end < 0 || end < begin) return text
  const block = text.slice(begin + BEGIN.length, end)
  const open = block.indexOf('{')
  const close = block.lastIndexOf('}')
  if (open < 0 || close < open) return text
  const manifest = JSON.parse(block.slice(open, close + 1))
  mutate(manifest)
  const rebuilt = `${block.slice(0, open)}${JSON.stringify(manifest, null, 2)}${block.slice(close + 1)}`
  return text.slice(0, begin + BEGIN.length) + rebuilt + text.slice(end)
}

function replaceInPreview(text, mutate) {
  const start = text.indexOf(GATE_HEADINGS.PREVIEW)
  const end = text.indexOf(GATE_HEADINGS.FULLSTACK)
  if (start < 0 || end < start) return text
  const section = text.slice(start, end)
  return text.slice(0, start) + mutate(section) + text.slice(end)
}

function selfTest() {
  const baseText = loadContract(DEFAULT_CONTRACT)
  const cases = [
    {
      name: 'valid contract is accepted',
      expect: null,
      mutate: (text) => text,
    },
    {
      name: 'preview gate that claims production is rejected',
      expect: 'preview gate must not claim production',
      mutate: (text) =>
        replaceManifest(text, (manifest) => {
          manifest.gates.PREVIEW.production_claim = true
          manifest.gates.PREVIEW.may_claim.push('production deployment')
        }),
    },
    {
      name: 'full-stack gate missing an evidence class is rejected',
      expect: 'missing full-stack evidence class EV-RESTORE',
      mutate: (text) =>
        replaceManifest(text, (manifest) => {
          manifest.gates.FULLSTACK.required_evidence = manifest.gates.FULLSTACK.required_evidence.filter(
            (code) => code !== 'EV-RESTORE',
          )
        }),
    },
    {
      name: 'gate without an exact-SHA requirement is rejected',
      expect: 'exact-SHA',
      mutate: (text) =>
        replaceManifest(text, (manifest) => {
          manifest.gates.FULLSTACK.exact_sha_required = false
        }),
    },
    {
      name: 'prose preview claim of production is rejected',
      expect: 'preview gate must not claim production',
      mutate: (text) =>
        replaceInPreview(text, (section) =>
          section.replace(/^- MAY CLAIM: /m, '- MAY CLAIM: production deployment, '),
        ),
    },
    {
      name: 'missing manifest marker is rejected',
      expect: 'manifest marker',
      mutate: (text) => text.replace(END, ''),
    },
    {
      name: 'missing preview evidence bullet is rejected',
      expect: 'preview section does not list required evidence EV-RIGHTS',
      mutate: (text) =>
        replaceInPreview(text, (section) =>
          section.replace(/^- `EV-RIGHTS`.*\r?\n/m, ''),
        ),
    },
  ]

  let failed = 0
  for (const testCase of cases) {
    const { errors } = validate(testCase.mutate(baseText))
    const shouldAccept = testCase.expect === null
    const behaved = shouldAccept ? errors.length === 0 : errors.some((error) => error.includes(testCase.expect))
    console.log(`${behaved ? 'PASS' : 'FAIL'}  ${shouldAccept ? 'accept' : 'reject'}: ${testCase.name}`)
    if (!behaved) {
      failed++
      console.log(`      expected ${shouldAccept ? 'no errors' : JSON.stringify(testCase.expect)}`)
      console.log(`      observed: ${errors.length === 0 ? '(no errors)' : errors.slice(0, 3).join(' | ')}`)
    }
  }
  console.log(
    failed === 0
      ? `SELF-TEST PASS: ${cases.length}/${cases.length} fixtures behaved as expected`
      : `SELF-TEST FAIL: ${failed}/${cases.length} fixture(s) misbehaved`,
  )
  return failed
}

const args = process.argv.slice(2)
if (args.includes('--self-test')) {
  process.exit(selfTest() === 0 ? 0 : 1)
}

const contractArg = args.find((arg) => arg.startsWith('--contract='))
const contractPath = contractArg ? contractArg.slice('--contract='.length) : DEFAULT_CONTRACT
let text
try {
  text = loadContract(contractPath)
} catch (error) {
  console.error(`FAIL: cannot read ${contractPath}: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}

const { errors, summary } = validate(text)
if (errors.length > 0) {
  for (const error of errors) console.error(`VIOLATION ${error}`)
  console.error(`FAIL: ${errors.length} violation(s)`)
  process.exit(1)
}
console.log(`PASS contract=${contractPath} gates=2 sha_length=40 anchors=${REQUIRED_ANCHORS.length}`)
console.log(`PASS phrases=${REQUIRED_PHRASES.length} manifest=parseable`)
for (const key of ['PREVIEW', 'FULLSTACK']) {
  console.log(
    `PASS ${key} evidence=${summary[key].evidence} may_claim=${summary[key].mayClaim} must_not_claim=${summary[key].mustNotClaim}`,
  )
}
console.log(`PASS evidence_classes=${REQUIRED_FULLSTACK_EVIDENCE.length} preview_is_strict_subset=yes`)
