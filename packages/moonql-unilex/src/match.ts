/**
 * Lexical matching rules for UNILEX.
 *
 * The classifier answers a deliberately narrow question: do these two strings
 * look like the same written form? It never answers "are these the same
 * concept". A surface match only opens a reviewer decision; no relation is
 * created here, and `exactMatch` is never produced automatically.
 */

export type MatchClass = 'EXACT' | 'NEAR' | 'DIFFERENT'
export type MatchScript = 'Latn' | 'Arab' | 'Hebr' | 'Grek' | 'Zyyy'
export type MatchDirection = 'ltr' | 'rtl'

export interface MatchInput {
  text: string
  language?: string | null
}

export interface AnalyzedForm {
  raw: string
  normalized: string
  script: MatchScript
  direction: MatchDirection
  language: string | null
  mixedScripts: boolean
  diacriticsPresent: boolean
}

export interface MatchPreview {
  classification: MatchClass
  left: AnalyzedForm
  right: AnalyzedForm
  similarity: number
  sameSurface: boolean
  suggestedAction: 'REVIEW_SENSE_SCOPE' | 'REVIEW_NEAR_MATCH' | 'NO_AUTOMATIC_MATCH'
  requiresReview: true
  identityClaimed: false
  autoRelation: null
  reasons: string[]
}

/** Above this ratio two same-script forms are offered for near-match review. */
const NEAR_THRESHOLD = 0.75

const ARABIC_MARKS = /[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g
const HEBREW_MARKS = /[\u0591-\u05c7]/g
const COMBINING_MARKS = /[\u0300-\u036f]/g
const TATWEEL = /\u0640/g
const ALEF_VARIANTS = /[\u0622\u0623\u0625\u0671]/g

const SCRIPT_RANGES: Array<{ script: Exclude<MatchScript, 'Zyyy'>; re: RegExp }> = [
  { script: 'Arab', re: /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff]/g },
  { script: 'Hebr', re: /[\u0590-\u05ff]/g },
  { script: 'Grek', re: /[\u0370-\u03ff\u1f00-\u1fff]/g },
  { script: 'Latn', re: /[A-Za-z\u00c0-\u024f]/g },
]

export function detectScript(text: string): { script: MatchScript; mixedScripts: boolean } {
  const counts = new Map<Exclude<MatchScript, 'Zyyy'>, number>()
  for (const { script, re } of SCRIPT_RANGES) {
    const matches = text.match(re)
    if (matches) counts.set(script, matches.length)
  }
  if (counts.size === 0) return { script: 'Zyyy', mixedScripts: false }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const top = ranked[0]
  if (!top) return { script: 'Zyyy', mixedScripts: false }
  return { script: top[0], mixedScripts: ranked.length > 1 }
}

/**
 * Comparison form: keeps letters and digits, drops case, diacritics and
 * separators. The raw headword is stored elsewhere and is never overwritten.
 */
export function normalizeHeadword(text: string): string {
  return text
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(HEBREW_MARKS, '')
    .replace(ARABIC_MARKS, '')
    .replace(TATWEEL, '')
    .replace(ALEF_VARIANTS, '\u0627')
    .replace(/\u03c2/g, '\u03c3')
    .toLowerCase()
    .match(/[\p{L}\p{N}]/gu)
    ?.join('') ?? ''
}

function hasDiacritics(text: string): boolean {
  return /[\u0300-\u036f\u0591-\u05c7\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/.test(
    text.normalize('NFD'),
  )
}

export function analyzeForm(input: MatchInput): AnalyzedForm {
  const raw = input.text.trim()
  const { script, mixedScripts } = detectScript(raw)
  return {
    raw,
    normalized: normalizeHeadword(raw),
    script,
    direction: script === 'Arab' || script === 'Hebr' ? 'rtl' : 'ltr',
    language: input.language?.trim().toLowerCase() || null,
    mixedScripts,
    diacriticsPresent: hasDiacritics(raw),
  }
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1)
      current[j] = Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, substitution)
    }
    previous = current
  }
  return previous[b.length] ?? Math.max(a.length, b.length)
}

export function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1
  const longest = Math.max(a.length, b.length)
  return longest === 0 ? 1 : 1 - levenshtein(a, b) / longest
}

/**
 * Surface classification only. Even EXACT means "same written form", never
 * "same sense"; callers must send a reviewer decision to create a relation.
 */
export function classifyMatch(
  leftInput: MatchInput,
  rightInput: MatchInput,
): MatchPreview {
  const left = analyzeForm(leftInput)
  const right = analyzeForm(rightInput)
  const score = similarity(left.normalized, right.normalized)
  const sameSurface = left.normalized.length > 0 && left.normalized === right.normalized
  const reasons: string[] = []

  let classification: MatchClass
  if (!left.normalized || !right.normalized) {
    classification = 'DIFFERENT'
    reasons.push('one side has no comparable letters')
  } else if (left.script !== right.script && left.script !== 'Zyyy' && right.script !== 'Zyyy') {
    classification = 'DIFFERENT'
    reasons.push(`scripts differ (${left.script} vs ${right.script}); a transliteration is not identity`)
  } else if (sameSurface) {
    if (left.language && right.language && left.language !== right.language) {
      classification = 'NEAR'
      reasons.push('same written form but different declared language')
    } else {
      classification = 'EXACT'
      reasons.push('same normalized written form in the same script')
    }
  } else if (left.script === right.script && score >= NEAR_THRESHOLD) {
    classification = 'NEAR'
    reasons.push(`same script, ${Math.round(score * 100)}% surface similarity`)
  } else {
    classification = 'DIFFERENT'
    reasons.push('different normalized forms')
  }

  reasons.push('surface classification is not a sense or identity claim')
  const suggestedAction =
    classification === 'EXACT'
      ? 'REVIEW_SENSE_SCOPE'
      : classification === 'NEAR'
        ? 'REVIEW_NEAR_MATCH'
        : 'NO_AUTOMATIC_MATCH'

  return {
    classification,
    left,
    right,
    similarity: Math.round(score * 100) / 100,
    sameSurface,
    suggestedAction,
    requiresReview: true,
    identityClaimed: false,
    autoRelation: null,
    reasons,
  }
}
