import { analyzeForm, type AnalyzedForm, type MatchScript } from './match.js'

export interface CognateEntry {
  term: string
  script: MatchScript
  language: string
  transliteration?: string
  consonantalRoot?: string
  semanticScope: string
}

export interface TriangulatedConcept {
  id: string
  canonicalName: string
  triangulationStatus: 'ESTABLISHED' | 'HYPOTHESIS' | 'DISPUTED'
  cognates: CognateEntry[]
  theologicalGuardrail: string
}

/**
 * Pinned trilateral roots and comparative Semitic cognates
 * adhering strictly to M09-03/04 (refusing false auto-sameAs collapses).
 */
const TRIANGULATION_TABLE: Record<string, TriangulatedConcept> = {
  peace: {
    id: 'tri-peace',
    canonicalName: 'Peace / Reconciliation',
    triangulationStatus: 'ESTABLISHED',
    theologicalGuardrail: 'Distinguish existential peace (Salam/Shalom) from geopolitical armistice.',
    cognates: [
      {
        term: 'سَلَام',
        script: 'Arab',
        language: 'ar',
        transliteration: 'salām',
        consonantalRoot: 's-l-m',
        semanticScope: 'Wholeness, safety, divine salutation, submission to cosmic order.',
      },
      {
        term: 'שָׁלוֹם',
        script: 'Hebr',
        language: 'he',
        transliteration: 'shalōm',
        consonantalRoot: 'sh-l-m',
        semanticScope: 'Completeness, communal flourishing, covenantal integrity.',
      },
      {
        term: 'εἰρήνη',
        script: 'Grek',
        language: 'el',
        transliteration: 'eirēnē',
        semanticScope: 'State of tranquility, absence of strife, spiritual concord.',
      },
    ],
  },
  truth: {
    id: 'tri-truth',
    canonicalName: 'Truth / Reality',
    triangulationStatus: 'ESTABLISHED',
    theologicalGuardrail: 'Maintain strict distinction between Al-Haqq (Divine Absolute Reality) and procedural veracity.',
    cognates: [
      {
        term: 'حَقّ',
        script: 'Arab',
        language: 'ar',
        transliteration: 'ḥaqq',
        consonantalRoot: 'ḥ-q-q',
        semanticScope: 'Absolute reality, verified truth, obligatory claim, divine name.',
      },
      {
        term: 'אֱמֶת',
        script: 'Hebr',
        language: 'he',
        transliteration: 'ʾemet',
        consonantalRoot: 'ʾ-m-t',
        semanticScope: 'Faithfulness, endurance, firmness, stability.',
      },
      {
        term: 'ἀλήθεια',
        script: 'Grek',
        language: 'el',
        transliteration: 'alētheia',
        semanticScope: 'Un-hiddenness, un-concealment, disclosure of reality.',
      },
    ],
  },
  mercy: {
    id: 'tri-mercy',
    canonicalName: 'Mercy / Compassion',
    triangulationStatus: 'ESTABLISHED',
    theologicalGuardrail: 'Separate primordial ontological mercy (Rahmah) from transactional pity.',
    cognates: [
      {
        term: 'رَحْمَة',
        script: 'Arab',
        language: 'ar',
        transliteration: 'raḥmah',
        consonantalRoot: 'r-ḥ-m',
        semanticScope: 'All-encompassing matrixial nurture, ontological benevolence.',
      },
      {
        term: 'חֶסֶד',
        script: 'Hebr',
        language: 'he',
        transliteration: 'ḥesed',
        consonantalRoot: 'ḥ-s-d',
        semanticScope: 'Covenantal lovingkindness, persistent steadfast loyalty.',
      },
      {
        term: 'ἔλεος',
        script: 'Grek',
        language: 'el',
        transliteration: 'eleos',
        semanticScope: 'Compassionate goodwill toward the vulnerable, clemency.',
      },
    ],
  },
}

/**
 * Triangulate comparative Semitic and Hellenic forms across UNILEX without forcing false equality.
 */
export function triangulateTerm(term: string): {
  analyzed: AnalyzedForm
  matches: TriangulatedConcept[]
} {
  const analyzed = analyzeForm({ text: term })
  const norm = analyzed.normalized.toLowerCase()

  const matches: TriangulatedConcept[] = []

  for (const concept of Object.values(TRIANGULATION_TABLE)) {
    // Check if term matches concept key or any cognate term
    if (concept.canonicalName.toLowerCase().includes(norm) || concept.id.includes(norm)) {
      matches.push(concept)
      continue
    }

    const hasCognateMatch = concept.cognates.some(
      (c) =>
        c.term === term ||
        c.term.includes(analyzed.normalized) ||
        (c.transliteration && c.transliteration.toLowerCase().includes(norm)),
    )

    if (hasCognateMatch) {
      matches.push(concept)
    }
  }

  return {
    analyzed,
    matches,
  }
}
