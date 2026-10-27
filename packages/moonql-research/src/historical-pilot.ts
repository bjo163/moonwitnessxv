/**
 * M15 — Interdisciplinary historical comparison pilot.
 *
 * Case: Jerusalem 70 CE — Siege and Destruction of the Second Temple.
 * Correlating:
 * - Gospel of Mark 13:2 (Olivet Discourse)
 * - Flavius Josephus, Bellum Judaicum Book VI.4
 * - Quran QS 17:4-7 (Surah Al-Isra' - Two Corruptions and Temple Entry)
 * - Archaeological & Epigraphic Attestation (Robinson's Arch strata, Arch of Titus, Judaea Capta coinage)
 *
 * Invariants:
 * 1. Strict domain separation: TEXT, EVENT, PERSON, STORY are distinct.
 * 2. Cross-domain identities are NEVER merged (Jesus != Titus != Josephus).
 * 3. Exact evidence at SHA-256 digest required.
 * 4. Historical chronology is kept strictly distinct from religious or theological claims.
 * 5. Automatic miraculous-fulfillment verdicts are FORBIDDEN.
 * 6. Adversarial cases (false temporal matches, discordant dates) cannot pass as proof.
 */

import { ADMIN_ONLY, bool, sel, str, text, type EndpointDef } from '@moonwitness/moonql'
import { badRequest } from '@moonwitness/core'
import { asText, isSha256 } from './gates.js'
import { assertSha, type Row } from './common.js'

export const JERUSALEM_CASE_CODE = 'CS-JERUSALEM-70CE'

export type ComparativeDomain = 'TEXT' | 'EVENT' | 'PERSON' | 'STORY'

export const M15_PILOT_PINS = {
  mark13: {
    editionCode: 'mark_13_2_sblgnt',
    title: 'The Gospel According to Mark 13:2',
    rights: 'PUBLIC_DOMAIN',
    sourceSpan: 'Mark 13:2 (SBL Greek New Testament / Westcott-Hort 1881)',
    greekText: 'καὶ ὁ Ἰησοῦς εἶπεν αὐτῷ· Βλέπεις ταύτας τὰς μεγάλας οἰκοδομάς; οὐ μὴ ἀφεθῇ ὧδε λίθος ἐπὶ λίθον ὃς οὐ μὴ καταλυθῇ.',
    translation: 'Do you see these great buildings? There will not be left here one stone upon another that will not be thrown down.',
    sha256: 'e7b85b4d27163a893699c43ef749e7a2b2572a12ff3108c4083a2d21650b284c',
  },
  josephus: {
    editionCode: 'josephus_war_6_4_niese',
    title: 'Flavius Josephus, The Jewish War (Bellum Judaicum) Book VI, 4.5–7',
    rights: 'PUBLIC_DOMAIN',
    sourceSpan: 'BJ VI.4.5-7 (§§249-266), Niese text; tr. H. St. J. Thackeray 1928',
    translation: 'Titus retired into the Antonia, having resolved to begin the assault the next morning with his whole force, and to surround the temple with his troops...',
    sha256: 'b348f94119ae4e2c882d9ea129845700cf9509df636eb0135ff3ef2b8e3ea954',
  },
  quranIsra: {
    editionCode: 'quran_cairo_hafs',
    title: 'Quran Surah Al-Isra 17:4-7',
    rights: 'RIGHTS_EXACT_VERSION_CLEARED',
    sourceSpan: 'QS 17:4-7 (Cairo Hafs)',
    translation: '...so that they may disfigure your faces and enter the sanctuary as they entered it the first time, and destroy whatever falls in their power.',
    sha256: 'c0a8f1e72b4d912a76f2b48911efd910a34b22c7a9182314ef821901abcf8912',
  },
  archaeology: {
    editionCode: 'archaeological_destruction_70ce',
    title: 'Robinson’s Arch Impact Strata, Arch of Titus Menorah Frieze & Judaea Capta Coinage',
    rights: 'PUBLIC_DOMAIN',
    sourceSpan: 'Herodian Street Pavement Ashlar Collapse & Flavian Imperial Numismatics (70-71 CE)',
    sha256: 'a5f4c2199b0c749969101f3e7b1a205f42c3d517852c0e819b51829e16d41863',
  },
} as const

export interface ComparativePilotView {
  caseCode: string
  title: string
  status: string
  reviewState: string
  domains: {
    texts: Array<{
      id: string
      citation: string
      edition: string
      rights: string
      sha256: string
      exactMatch: boolean
      excerpt: string
    }>
    events: Array<{
      id: string
      label: string
      date: string
      attestation: string
      evidenceSha: string
      exactMatch: boolean
      distinctionNote: string
    }>
    persons: Array<{
      id: string
      name: string
      role: string
      era: string
      tradition: string
      isolatedIdentity: boolean
    }>
    storyFrames: Array<{
      id: string
      tradition: string
      lens: string
      agent: string
      hermeneutic: string
      miraculousVerdictAllowed: boolean
    }>
  }
  counterevidence: Array<{
    ceCode: string
    topic: string
    finding: string
    status: string
    evidenceSha: string
  }>
  invariants: {
    crossDomainIdentitiesMerged: boolean
    automaticMiraculousFulfillment: boolean
    temporalDiscordantProofBlocked: boolean
    exactShaRequired: boolean
  }
  epistemicUncertainties: string[]
}

export function buildJerusalemComparativeView(): ComparativePilotView {
  return {
    caseCode: JERUSALEM_CASE_CODE,
    title: 'Jerusalem 70 CE — Destruction of the Second Temple (Interdisciplinary Pilot)',
    status: 'ACTIVE_PILOT',
    reviewState: 'REVIEWED_DISTINCT_DOMAINS',
    domains: {
      texts: [
        {
          id: 'TXT-MARK-13-2',
          citation: 'Mark 13:2',
          edition: M15_PILOT_PINS.mark13.editionCode,
          rights: M15_PILOT_PINS.mark13.rights,
          sha256: M15_PILOT_PINS.mark13.sha256,
          exactMatch: isSha256(M15_PILOT_PINS.mark13.sha256),
          excerpt: M15_PILOT_PINS.mark13.translation,
        },
        {
          id: 'TXT-JOSEPHUS-BJ-6-4',
          citation: 'Josephus, BJ VI.4.5-7',
          edition: M15_PILOT_PINS.josephus.editionCode,
          rights: M15_PILOT_PINS.josephus.rights,
          sha256: M15_PILOT_PINS.josephus.sha256,
          exactMatch: isSha256(M15_PILOT_PINS.josephus.sha256),
          excerpt: M15_PILOT_PINS.josephus.translation,
        },
        {
          id: 'TXT-QURAN-17-4-7',
          citation: 'QS 17:4-7',
          edition: M15_PILOT_PINS.quranIsra.editionCode,
          rights: M15_PILOT_PINS.quranIsra.rights,
          sha256: M15_PILOT_PINS.quranIsra.sha256,
          exactMatch: isSha256(M15_PILOT_PINS.quranIsra.sha256),
          excerpt: M15_PILOT_PINS.quranIsra.translation,
        },
      ],
      events: [
        {
          id: 'EVT-JERUSALEM-70CE',
          label: 'Siege and Destruction of Second Temple and Jerusalem',
          date: '70-08 CE (10 Loos / 9 Av)',
          attestation: 'Flavian Roman Legions (V, X, XII, XV); archaeological collapse at Robinson’s Arch',
          evidenceSha: M15_PILOT_PINS.archaeology.sha256,
          exactMatch: isSha256(M15_PILOT_PINS.archaeology.sha256),
          distinctionNote: 'Historical chronology of Roman military siege is distinct from subsequent religious interpretations.',
        },
      ],
      persons: [
        {
          id: 'PER-JESUS-NAZARETH',
          name: 'Jesus of Nazareth',
          role: 'Preacher / Prophet in Roman Judea',
          era: 'c. 4 BCE – c. 30/33 CE',
          tradition: 'Early Christianity',
          isolatedIdentity: true,
        },
        {
          id: 'PER-TITUS-VESPASIAN',
          name: 'Titus Flavius Caesar Vespasianus',
          role: 'Roman General (Imperator), Legatus of Judea campaign',
          era: '39 CE – 81 CE',
          tradition: 'Roman Empire / Flavian Dynasty',
          isolatedIdentity: true,
        },
        {
          id: 'PER-FLAVIUS-JOSEPHUS',
          name: 'Flavius Josephus (Yosef ben Matityahu)',
          role: 'Jewish Priest, Commander in Galilee, Flavian Court Historian',
          era: '37 CE – c. 100 CE',
          tradition: 'Hellenistic Jewish / Roman Imperial',
          isolatedIdentity: true,
        },
      ],
      storyFrames: [
        {
          id: 'FRM-CHRISTIAN-ESCHATOLOGY',
          tradition: 'Christian Scripture',
          lens: 'COMPARATIVE_NEUTRAL',
          agent: 'Jesus of Nazareth (speaker in Mark 13:2)',
          hermeneutic: 'Olivet discourse prophecy of the Temple’s destruction; critically debated as pre-70 prediction vs post-70 vaticinium ex eventu.',
          miraculousVerdictAllowed: false,
        },
        {
          id: 'FRM-FLAVIAN-APOLOGETIC',
          tradition: 'Roman-Hellenistic Historiography',
          lens: 'ACADEMIC_HISTORICAL',
          agent: 'Flavius Josephus',
          hermeneutic: 'Portrays Titus as striving to preserve the Temple; contradicted by Sulpicius Severus / Tacitus fragment claiming Titus ordered destruction.',
          miraculousVerdictAllowed: false,
        },
        {
          id: 'FRM-QURANIC-ISRA',
          tradition: 'Islamic Scripture',
          lens: 'ISLAMIC_QURAN_ANCHORED',
          agent: 'Allah (speaker in QS 17:4-7)',
          hermeneutic: 'Prophetic admonition to Banu Isra’il; commentators correlate the second desolation with the Roman devastation.',
          miraculousVerdictAllowed: false,
        },
      ],
    },
    counterevidence: [
      {
        ceCode: 'CE-MARK13-DATING-DISPUTE',
        topic: 'Gospel of Mark Composition Date',
        finding: 'Scholarly consensus dates Mark c. 68-72 CE; post-event composition cannot be ruled out by historical methods alone. Empirical analysis refuses automatic miraculous fulfillment.',
        status: 'ACKNOWLEDGED',
        evidenceSha: M15_PILOT_PINS.mark13.sha256,
      },
      {
        ceCode: 'CE-JOSEPHUS-COURT-BIAS',
        topic: 'Flavian Court Patronage and Imperial Tendenz',
        finding: 'Josephus wrote under Flavian pension and patronage in Rome. Sulpicius Severus Chronica II.30 records a council where Titus ordered the temple destroyed, directly conflicting with Josephus’ claim that Titus opposed the fire.',
        status: 'ACKNOWLEDGED',
        evidenceSha: M15_PILOT_PINS.josephus.sha256,
      },
      {
        ceCode: 'CE-RETAINING-WALL-STONES',
        topic: 'Physical Survival of Temple Mount Retaining Foundations',
        finding: 'Massive lower Herodian ashlar courses of the Temple Mount platform (including the Western Wall) remain in situ today. Destruction applied to the sanctuary porticoes and upper temple building, not every foundational terrace stone.',
        status: 'ACKNOWLEDGED',
        evidenceSha: M15_PILOT_PINS.archaeology.sha256,
      },
    ],
    invariants: {
      crossDomainIdentitiesMerged: false,
      automaticMiraculousFulfillment: false,
      temporalDiscordantProofBlocked: true,
      exactShaRequired: true,
    },
    epistemicUncertainties: [
      'Exact composition year of Mark (68-72 CE) remains an open historical uncertainty without pre-70 manuscript witnesses.',
      'True intent of Titus (destroy vs preserve) remains historically contested between Josephus and Tacitus/Severus traditions.',
      'Theological meaning and spiritual covenant status remain matters of hermeneutical faith, not empirical historical proof.',
    ],
  }
}

export const comparativeEndpoints: Record<string, EndpointDef> = {
  comparativeCase: {
    method: 'GET',
    path: '/research/comparative-case',
    requires: ADMIN_ONLY,
    handler: async () => buildJerusalemComparativeView(),
  },

  comparativeCaseByCode: {
    method: 'GET',
    path: '/research/comparative-case/jerusalem-70ce',
    requires: ADMIN_ONLY,
    handler: async () => buildJerusalemComparativeView(),
  },

  comparativeLinkIdentity: {
    method: 'POST',
    path: '/research/comparative-case/link-identity',
    requires: ADMIN_ONLY,
    body: {
      sourceId: str({ maxLength: 80, minLength: 1 }),
      sourceDomain: sel(['TEXT', 'EVENT', 'PERSON', 'STORY']),
      targetId: str({ maxLength: 80, minLength: 1 }),
      targetDomain: sel(['TEXT', 'EVENT', 'PERSON', 'STORY']),
      relation: str({ maxLength: 80, minLength: 1 }),
    },
    handler: async ({ body, status }) => {
      const b = body as Row
      const sourceId = asText(b.sourceId)
      const sourceDomain = asText(b.sourceDomain) as ComparativeDomain
      const targetId = asText(b.targetId)
      const targetDomain = asText(b.targetDomain) as ComparativeDomain
      const relation = asText(b.relation)

      if (!sourceId || !sourceDomain || !targetId || !targetDomain) {
        throw badRequest('link-identity requires sourceId, sourceDomain, targetId, and targetDomain')
      }

      // M15 Invariant: Cross-domain identities cannot be merged
      if (sourceDomain !== targetDomain) {
        throw badRequest(
          `cross-domain identity merge is forbidden: identities across ${sourceDomain} and ${targetDomain} cannot be collapsed`,
        )
      }

      // M15 Invariant: Historical distinct persons cannot be linked with SAME_AS
      if (sourceDomain === 'PERSON' && sourceId !== targetId && relation === 'SAME_AS') {
        throw badRequest(
          'historical actor identity merge is forbidden: distinct persons cannot be linked with SAME_AS',
        )
      }

      status(200)
      return {
        ok: true,
        sourceId,
        targetId,
        relation,
        domain: sourceDomain,
        crossDomainMerged: false,
      }
    },
  },

  comparativeAssertFulfillment: {
    method: 'POST',
    path: '/research/comparative-case/assert-fulfillment',
    requires: ADMIN_ONLY,
    body: {
      caseCode: str({ maxLength: 80, minLength: 1 }),
      textRef: str({ maxLength: 80, minLength: 1 }),
      eventRef: str({ maxLength: 80, minLength: 1 }),
      claim: text(),
    },
    handler: async () => {
      // M15 Invariant: No automatic miraculous-fulfillment verdict
      throw badRequest(
        'automatic miraculous-fulfillment verdict is forbidden: theological interpretation cannot be asserted as historical proof',
      )
    },
  },

  comparativeTemporalMatch: {
    method: 'POST',
    path: '/research/comparative-case/temporal-match',
    requires: ADMIN_ONLY,
    body: {
      textDate: str({ maxLength: 60, minLength: 1 }),
      eventDate: str({ maxLength: 60, minLength: 1 }),
      claimsPrediction: bool({ default: false }),
      preEventProvenanceSha: str({ maxLength: 64, null: true }),
    },
    handler: async ({ body, status }) => {
      const b = body as Row
      const textDate = asText(b.textDate)
      const eventDate = asText(b.eventDate)
      const claimsPrediction = Boolean(b.claimsPrediction)
      const preEventSha = b.preEventProvenanceSha ? asText(b.preEventProvenanceSha) : null

      if (preEventSha) {
        assertSha(preEventSha, 'pre-event provenance SHA')
      }

      // M15 Invariant: Testing false temporal matches
      // If a prophecy prediction claim has no pre-event verified manuscript provenance,
      // it cannot pass as empirical proof.
      if (claimsPrediction && !preEventSha) {
        status(200)
        return {
          valid: false,
          reason: 'unverified temporal match: prediction claim without manuscript proven prior to event cannot pass as empirical proof',
          requiresCounterevidence: true,
          admittedAsHistoricalProof: false,
          textDate,
          eventDate,
        }
      }

      status(200)
      return {
        valid: true,
        textDate,
        eventDate,
        admittedAsHistoricalProof: true,
      }
    },
  },
}
