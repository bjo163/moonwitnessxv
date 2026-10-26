import type { ReactNode } from 'react'
import { Card, CardBody, CardHeader, Tape, Badge, ZineNote, PageHeader } from '@moonwitness/moonui'
import { createPassageCitation } from '@moonwitness/core'

interface ParallelEdition {
  editionCode: string
  name: string
  tradition: string
  script: 'Arab' | 'Latn'
  direction: 'rtl' | 'ltr'
  text: string
  licenseStatus: 'RIGHTS_CLEARED' | 'METADATA_ONLY'
}

const EDITIONS_QS_2_82: ParallelEdition[] = [
  {
    editionCode: 'quran_cairo_hafs',
    name: 'Cairo Hafs (1924 Standard)',
    tradition: 'Uthmanic Hafs an Asim',
    script: 'Arab',
    direction: 'rtl',
    text: 'وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ',
    licenseStatus: 'RIGHTS_CLEARED',
  },
  {
    editionCode: 'quran_warsh_madina',
    name: 'Warsh an Nafi (Madinah 1422)',
    tradition: 'Maghrebi / North African Witness',
    script: 'Arab',
    direction: 'rtl',
    text: 'وَٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَٰتِ أُو۟لَـٰٓئِكَ أَصْحَـٰبُ ٱلْجَنَّةِ ۖ هُمْ فِيهَا خَـٰلِدُونَ',
    licenseStatus: 'RIGHTS_CLEARED',
  },
  {
    editionCode: 'id_kemenag_2019',
    name: 'Indonesian Kemenag (2019 Revised)',
    tradition: 'Southeast Asian Vernacular',
    script: 'Latn',
    direction: 'ltr',
    text: 'Adapun orang-orang yang beriman dan beramal saleh, mereka itulah penghuni surga; mereka kekal di dalamnya.',
    licenseStatus: 'RIGHTS_CLEARED',
  },
  {
    editionCode: 'en_sahih_international',
    name: 'Sahih International',
    tradition: 'Modern English Semantic Rendering',
    script: 'Latn',
    direction: 'ltr',
    text: 'But they who believe and do righteous deeds - those are the companions of Paradise; they will abide therein eternally.',
    licenseStatus: 'RIGHTS_CLEARED',
  },
  {
    editionCode: 'ar_corpus_morphology',
    name: 'Arabic Grammar & Syntax Segment',
    tradition: 'Syntactic Parsing Representation',
    script: 'Latn',
    direction: 'ltr',
    text: 'wa (conjunction) + allaḏīna (relative pronoun) + ʾāmanū (verb perfect 3mp) + wa-ʿamilū (verb) + aṣ-ṣāliḥāti (accusative feminine plural noun).',
    licenseStatus: 'RIGHTS_CLEARED',
  },
  {
    editionCode: 'comparative_commentary_note',
    name: 'Editorial Linguistic Note',
    tradition: 'Reviewer Commentary',
    script: 'Latn',
    direction: 'ltr',
    text: 'Note structural correlation: faith (īmān) consistently syntactically conjoined with righteous action (ʿamal ṣāliḥ) across all witnesses.',
    licenseStatus: 'RIGHTS_CLEARED',
  },
]

export default async function ComparePage(): Promise<ReactNode> {
  const citations = await Promise.all(
    EDITIONS_QS_2_82.map((e) =>
      createPassageCitation({
        workRef: 'quran',
        editionRef: e.editionCode,
        address: '2:82',
        textPayload: e.text,
        rightsCleared: e.licenseStatus === 'RIGHTS_CLEARED',
      }),
    ),
  )

  return (
    <div className="m-stack" style={{ gap: 24, maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <PageHeader
          title="Comparative 1·6·3 Workbench"
          subtitle="One Passage (QS 2:82) · Six Parallel Editions · Three Analytical Dimensions"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Reader', href: '/reader' },
            { label: 'Compare' },
          ]}
          actions={<Badge tone="ok">RIGHTS CLEARED</Badge>}
        />

        <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <Tape tone="accent">PASSAGE: QS 2:82 (AL-BAQARAH)</Tape>
          <div className="m-row" style={{ gap: 8 }}>
            <Badge tone="cyan">1 PASSAGE</Badge>
            <Badge tone="pink">6 EDITIONS</Badge>
            <Badge tone="accent">3 DIMENSIONS</Badge>
          </div>
        </div>

        {/* 6 Parallel Editions Grid */}
        <div className="m-grid m-grid-2" style={{ gap: 16 }}>
          {EDITIONS_QS_2_82.map((e, idx) => {
            const cit = citations[idx] ?? citations[0]
            if (!cit) return null
            return (
              <Card key={e.editionCode} variant="default" className="flex flex-col justify-between">
                <CardHeader
                  title={e.name}
                  subtitle={e.tradition}
                  actions={
                    <Badge tone={e.script === 'Arab' ? 'cyan' : 'accent'}>
                      {e.script} [{e.direction.toUpperCase()}]
                    </Badge>
                  }
                />
                <CardBody>
                  <div
                    style={{
                      fontSize: e.script === 'Arab' ? 22 : 14,
                      lineHeight: e.script === 'Arab' ? 2.0 : 1.6,
                      direction: e.direction,
                      textAlign: e.direction === 'rtl' ? 'right' : 'left',
                      fontFamily: e.script === 'Arab' ? '"Traditional Arabic", "Amiri", serif' : 'var(--font-sans)',
                      color: 'var(--fg)',
                      padding: '12px 0',
                    }}
                  >
                    {e.text}
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid var(--border)',
                      paddingTop: 8,
                      marginTop: 8,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--muted)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <div>URN: {cit.urn}</div>
                    <div>SHA-256: {cit.fingerprint.slice(0, 24)}…</div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>

        <ZineNote tone="dark" tilt="none">
          EPISTEMIC GUARDRAIL: Comparative viewing preserves parallel textual witnesses side-by-side without asserting false identity or erasing translator lineages.
        </ZineNote>
      </div>
  )
}
