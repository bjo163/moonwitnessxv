import type { ReactNode } from 'react'
import { Card, CardBody, CardHeader, Crown, Tape, Badge, ZineNote } from '@moonwitness/moonui'
import { SiteLayout } from '@/layouts/site'

interface NarrativeEra {
  eraNum: number
  title: string
  subtitle: string
  tone: 'cyan' | 'pink' | 'accent' | 'night'
  description: string
}

const ERAS: NarrativeEra[] = [
  { eraNum: 1, title: 'BEFORE LIGHT', subtitle: 'Genesis & Deep Silence', tone: 'night', description: 'The primordial void before memory, raw potential without recorded witness.' },
  { eraNum: 2, title: 'THE ARRIVAL', subtitle: 'First Signals Detected', tone: 'cyan', description: 'Initial contact, first transmissions caught on analog receiver frequencies.' },
  { eraNum: 3, title: 'THE WITNESS', subtitle: 'The Vow of Observation', tone: 'accent', description: 'The formal establishment of observation without premature moral judgment.' },
  { eraNum: 4, title: 'THE RUNAWAYS', subtitle: 'Exile, Distance & Nomads', tone: 'pink', description: 'Fracture from centralized authority; wanderers searching for uncompromised truth.' },
  { eraNum: 5, title: 'THE EXPOSURE', subtitle: 'Signals Unveiled', tone: 'pink', description: 'Hidden fault lines surface into public view; contradictions made undeniable.' },
  { eraNum: 6, title: 'THE CHANGE', subtitle: 'Transition & Decision', tone: 'accent', description: 'The turning point where understanding transforms into structural transformation.' },
  { eraNum: 7, title: 'END OF AN ERA', subtitle: 'Surrender of Old Forms', tone: 'night', description: 'The dismantling of obsolete architectures and honoring of fallen prototypes.' },
  { eraNum: 8, title: 'NEXT PHASE', subtitle: 'The Grand Constellation', tone: 'cyan', description: 'Moonwitness XV: unified observatory linking Corpus, Radar, Sound, and Empire.' },
]

export default function TimelinePage(): ReactNode {
  return (
    <SiteLayout>
      <div className="m-stack" style={{ gap: 24, maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
        <div>
          <div className="m-row" style={{ gap: 10, alignItems: 'center' }}>
            <Crown tone="cyan" size="md" />
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, margin: 0, letterSpacing: '0.04em' }}>
              THE 8 NARRATIVE ERAS
            </h1>
          </div>
          <p className="m-muted" style={{ margin: '6px 0 0', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            Chronicle of the Observatory · Preserved from Moonwitness II `data/eras.yaml`
          </p>
        </div>

        <div className="m-stack" style={{ gap: 16 }}>
          {ERAS.map((era) => (
            <Card key={era.eraNum} variant="default" className="relative border-l-4 border-l-cyan-400">
              <CardHeader
                title={era.title}
                subtitle={era.subtitle}
                actions={
                  <Badge tone={era.tone === 'accent' ? 'accent' : era.tone === 'pink' ? 'pink' : 'cyan'}>
                    ERA {era.eraNum}
                  </Badge>
                }
              />
              <CardBody>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--fg)', lineHeight: 1.6 }}>
                  {era.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <Tape tone="pink">
          PAST PRESENCE: Eras do not perish; they continue to echo in current transmissions.
        </Tape>

        <ZineNote tone="dark" tilt="none">
          CHRONOLOGY NOTICE: Eras represent narrative phases of consciousness, not Gregorian historical epochs.
        </ZineNote>
      </div>
    </SiteLayout>
  )
}
