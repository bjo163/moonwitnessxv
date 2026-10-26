import type { ReactNode } from 'react'
import { Card, CardBody, CardHeader, Crown, Tape, Badge, ZineNote } from '@moonwitness/moonui'

interface PrismFunction {
  num: string
  name: string
  purpose: string
  tone: 'cyan' | 'pink' | 'accent' | 'night'
}

const PRISMS: PrismFunction[] = [
  { num: '01', name: 'STORYTELLING', purpose: 'Compose memories, people, events and fragments into narratives', tone: 'cyan' },
  { num: '02', name: 'EXPOSURE', purpose: 'Reveal hidden or missed signals while keeping uncertainty visible', tone: 'pink' },
  { num: '03', name: 'CHANGE ADVISORY BOARD', purpose: 'Inspect transitions, consequences, decisions and change proposals', tone: 'accent' },
  { num: '04', name: 'CHASING HEART', purpose: 'Themes of pursuit, attachment, emotional connection', tone: 'pink' },
  { num: '05', name: 'LOVESTRUCK', purpose: 'Love, vulnerability, closeness and emotional tension', tone: 'pink' },
  { num: '06', name: 'BREATH ELECTRIC', purpose: 'Music, atmosphere, energy, motion and rhythm', tone: 'cyan' },
  { num: '07', name: 'SEDUCTION', purpose: 'Curiosity, attraction, temptation and attachment', tone: 'accent' },
  { num: '08', name: 'FAULT LINES', purpose: 'Tension, fracture, mismatch, pressure and turning points', tone: 'pink' },
  { num: '09', name: 'VILLAIN OF THE STORY', purpose: 'Contextual narrative opposition, not permanent moral labeling', tone: 'night' },
  { num: '10', name: 'WITNESS ARCHIVE', purpose: 'Observations, messages, evidence, correction and temporal traces', tone: 'cyan' },
  { num: '11', name: "SANITY'S LAST BREATH", purpose: 'Narrative threshold preceding silence, surrender, change or ending', tone: 'pink' },
  { num: '12', name: 'PAST PRESENCE', purpose: 'Continuing memories, influence and unresolved consequences from past events', tone: 'cyan' },
  { num: '13', name: 'PROMOTING', purpose: 'Decide what deserves to continue after audit, evaluation and balancing', tone: 'accent' },
]

export default function PrismsPage(): ReactNode {
  return (
    <div className="m-stack" style={{ gap: 20, maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>
        <div className="m-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
              <Crown tone="gold" size="md" />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: 0, letterSpacing: '0.04em' }}>
                THE 13 PRISMS
              </h1>
            </div>
            <p className="m-muted" style={{ margin: '6px 0 0', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              Restored Heritage Functions of Moonwitness II · Section 21A.2
            </p>
          </div>
          <Tape tone="accent">CAPTURE → CONNECT → WITNESS → UNDERSTAND → PRESERVE</Tape>
        </div>

        <div className="m-grid m-grid-3" style={{ gap: 14 }}>
          {PRISMS.map((p) => (
            <Card key={p.num} variant="default" className="hover:border-cyan-400 transition-colors">
              <CardHeader
                title={p.name}
                subtitle={`PRISM #${p.num}`}
                actions={
                  <Badge tone={p.tone === 'accent' ? 'accent' : p.tone === 'pink' ? 'pink' : 'cyan'}>
                    {p.name.split(' ')[0]}
                  </Badge>
                }
              />
              <CardBody>
                <p style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5, margin: 0 }}>
                  {p.purpose}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div style={{ marginTop: 10 }}>
          <ZineNote tone="dark" tilt="none">
            HERITAGE PRINCIPLE: The Moon is an anchor. Witnesses record observations without imposing final dogma.
          </ZineNote>
        </div>
      </div>
  )
}
