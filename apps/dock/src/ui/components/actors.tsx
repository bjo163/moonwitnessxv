import type { ReactNode } from 'react'
import type { Locale } from '@moonwitness/core'
import { Badge, EmptyState, Panel, type BadgeTone } from '@moonwitness/moonui'
import type {
  ActorEvent,
  ActorRole,
  ActorTradition,
  AvatarPolicy,
  FigureDetail,
  FigureListItem,
  FigureRegistry,
  MissionRow,
  MissionTable,
} from '@/data/queries/actors'
import { SourceEvidence } from './provenance'
import { dockHrefFor } from '@/lib/locale-context.mjs'

const SCOPE_TONE: Record<string, BadgeTone> = {
  SCRIPTURE: 'cyan',
  EXEGESIS: 'moon',
  ACADEMIC: 'night',
  PROJECT: 'accent',
  CREATIVE: 'hot',
}

const EPISTEMIC_TONE: Record<string, BadgeTone> = {
  VERIFIED: 'ok',
  ASSERTED: 'accent',
  DISPUTED: 'hot',
  UNKNOWN: 'night',
}

const FIGURE_TONE: Record<string, BadgeTone> = {
  PROPHETIC_FIGURE: 'cyan',
  HISTORICAL_FIGURE: 'accent',
  COMMUNITY: 'night',
}

const ATTESTATION_TONE: Record<string, BadgeTone> = {
  SOURCE_REPORTED: 'ok',
  TRADITION_REPORTED: 'accent',
  CONTESTED: 'hot',
}

const FIGURE_STATUS_TONE: Record<string, BadgeTone> = {
  CANDIDATE: 'accent',
  REVIEWED: 'cyan',
  CONTESTED: 'hot',
}

const CHRONOLOGY_TONE: Record<string, BadgeTone> = {
  UNDATED: 'night',
  REPORTED_DATE: 'accent',
  DISPUTED_DATE: 'hot',
  ATTESTED_DATE: 'ok',
}

const ACCURACY_TONE: Record<string, BadgeTone> = {
  NAMED: 'cyan',
  REGION_ONLY: 'accent',
  UNNAMED: 'night',
}

const AVATAR_TONE: Record<string, BadgeTone> = {
  PROPOSAL: 'accent',
  DRAFT: 'moon',
  REVIEWED: 'ok',
}

const toneFor = (map: Record<string, BadgeTone>, status: string): BadgeTone => map[status] ?? 'night'

function TraditionBadge({ tradition }: { tradition: ActorTradition | null }): ReactNode {
  if (!tradition) return <Badge tone="night">NO TRADITION</Badge>
  return (
    <span className="dk-actors-tradition" data-tradition={tradition.code}>
      <Badge tone="night">{tradition.label}</Badge>
      <Badge tone={toneFor(SCOPE_TONE, tradition.scope)}>{tradition.scope}</Badge>
    </span>
  )
}

function StatGrid({ items }: { items: Array<{ label: string; value: number | string }> }): ReactNode {
  return (
    <dl className="dk-actors-stats">
      {items.map((item) => (
        <div className="dk-actors-stat" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            <strong>{item.value}</strong>
          </dd>
        </div>
      ))}
    </dl>
  )
}

function MissionFacts({ row }: { row: MissionRow }): ReactNode {
  return (
    <dl className="dk-actors-facts">
      <dt>Problem addressed</dt>
      <dd>{row.problemAddressed}</dd>
      <dt>Community</dt>
      <dd>{row.community}</dd>
      <dt>Historical setting</dt>
      <dd>{row.historicalSetting}</dd>
      <dt>Passage</dt>
      <dd>
        <code>{row.passageRef}</code>
      </dd>
      <dt>Roles</dt>
      <dd>{row.roles.length > 0 ? row.roles.join(' · ') : 'No role is claimed for this reading.'}</dd>
    </dl>
  )
}

function MissionCard({ row, locale = 'en' }: { row: MissionRow; locale?: Locale }): ReactNode {
  const localeHref = dockHrefFor(locale)
  return (
    <li
      className="dk-actors-mission"
      data-mission-code={row.missionCode}
      data-figure-code={row.figureCode}
      data-tradition={row.tradition?.code ?? ''}
    >
      <div className="dk-actors-mission-head">
        <div>
          <h3 className="dk-actors-mission-name">
            <a href={localeHref(`/figures/${row.figureCode}`)}>{row.labelEn}</a> <code>{row.figureCode}</code>
          </h3>
          <p className="dk-actors-mission-title">{row.title}</p>
          <span className="dk-actors-meta">
            {row.labelId} · <code>{row.missionCode}</code>
          </span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <TraditionBadge tradition={row.tradition} />
          <Badge tone={toneFor(EPISTEMIC_TONE, row.epistemicStatus)}>{row.epistemicStatus}</Badge>
          <span className="dk-actors-meta" data-status-label={row.epistemicStatus}>
            {row.statusLabel}
          </span>
        </div>
      </div>

      <MissionFacts row={row} />

      {row.interpretationNote ? (
        <div className="dk-actors-reading-note" data-reading-note="true">
          <strong>Interpretation note</strong>
          <p>{row.interpretationNote}</p>
        </div>
      ) : null}

      {row.reviewer || row.evidenceRef ? (
        <p className="dk-actors-meta" data-review="true">
          reviewer: {row.reviewer ?? '—'} · evidence: {row.evidenceRef ?? '—'}
          {row.reason ? ` · ${row.reason}` : ''}
        </p>
      ) : null}

      <SourceEvidence source={row.source} locale={locale} classPrefix="dk-actors" />
    </li>
  )
}

export function MissionTableView({ table, locale = 'en' }: { table: MissionTable; locale?: Locale }): ReactNode {
  return (
    <div className="dk-actors-stack">
      <StatGrid
        items={[
          { label: 'Figures', value: table.counts.figures },
          { label: 'Missions', value: table.counts.missions },
          { label: 'Readings', value: table.counts.readings },
          { label: 'Competing', value: table.counts.competingFigures },
          { label: 'Roles', value: table.counts.roles },
          { label: 'Events', value: table.counts.events },
          { label: 'Avatars', value: table.counts.avatars },
        ]}
      />

      <Panel title="Mission rows" subtitle={table.view.notice}>
        <div className="dk-actors-notices">
          <p className="dk-actors-notice" role="note">
            {table.noExclusive.notice}
          </p>
          <p className="dk-actors-notice" role="note">
            {table.readingsNotice}
          </p>
          <p className="dk-actors-notice" role="note">
            {table.identityNotice}
          </p>
        </div>

        {table.rows.length === 0 ? (
          <EmptyState
            title="No mission matches this filter"
            hint="Clear the filters; the table never invents a claim to fill a gap."
          />
        ) : (
          <ul className="dk-actors-missions" aria-label="Prophetic mission rows">
            {table.rows.map((row) => (
              <MissionCard row={row} key={row.missionCode} locale={locale} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="View authority"
        subtitle="The table is derived from the Figure Registry; it is not a second prophet database."
      >
        <dl className="dk-actors-facts">
          <dt>Derived from</dt>
          <dd>
            <code>{table.view.derivedFrom}</code> · separate figure table:{' '}
            {table.view.separateFigureTable ? 'yes' : 'no'}
          </dd>
          <dt>Authority</dt>
          <dd>
            <code>{table.authority.viewOf}</code> · read-only: {table.authority.readOnly ? 'yes' : 'no'}
          </dd>
          <dt>Canonical tables</dt>
          <dd>
            {table.authority.canonicalTables.map((name) => (
              <code className="dk-actors-table-code" key={name}>
                {name}
              </code>
            ))}
          </dd>
          <dt>Exclusive mission field</dt>
          <dd>{table.noExclusive.singleMissionField ? 'present' : 'absent — a figure may carry several missions'}</dd>
          <dt>Rank field</dt>
          <dd>{table.noExclusive.rankField ? 'present' : 'absent — no religious ranking exists'}</dd>
        </dl>
        <p className="dk-actors-meta">
          registry {table.meta.version} · {table.meta.status} · {table.meta.pins.quranEdition.citation} · vision{' '}
          <code>{table.meta.pins.vision.sha256.slice(0, 12)}</code>
        </p>
      </Panel>
    </div>
  )
}

function RoleRow({ role, locale }: { role: ActorRole; locale: Locale }): ReactNode {
  return (
    <li className="dk-actors-role" data-role-code={role.roleCode}>
      <div className="dk-actors-role-head">
        <strong>{role.role}</strong>
        <span className="dk-actors-meta">
          <code>{role.roleCode}</code> · passage <code>{role.passageRef}</code>
        </span>
      </div>
      <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <TraditionBadge tradition={role.tradition} />
        <Badge tone={toneFor(EPISTEMIC_TONE, role.epistemicStatus)}>{role.epistemicStatus}</Badge>
        <span className="dk-actors-meta">{role.statusLabel}</span>
      </div>
      {role.reviewer ? (
        <p className="dk-actors-meta">
          reviewer: {role.reviewer} · evidence: {role.evidenceRef ?? '—'}
        </p>
      ) : null}
      <SourceEvidence source={role.source} locale={locale} classPrefix="dk-actors" />
    </li>
  )
}

function FigureCard({ figure, locale = 'en' }: { figure: FigureListItem; locale?: Locale }): ReactNode {
  const localeHref = dockHrefFor(locale)
  return (
    <li className="dk-actors-figure" data-figure-code={figure.figureCode}>
      <div className="dk-actors-figure-head">
        <div>
          <h3 className="dk-actors-figure-name">
            <a href={localeHref(`/figures/${figure.figureCode}`)}>{figure.labelEn}</a>
          </h3>
          <span className="dk-actors-meta">
            {figure.labelId} · <code>{figure.figureCode}</code>
          </span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={toneFor(FIGURE_TONE, figure.figureKind)}>{figure.figureKind}</Badge>
          <Badge tone={toneFor(ATTESTATION_TONE, figure.attestation)}>{figure.attestation}</Badge>
          <Badge tone={toneFor(FIGURE_STATUS_TONE, figure.status)}>{figure.status}</Badge>
        </div>
      </div>

      <p className="dk-actors-figure-summary">{figure.summary}</p>

      <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <Badge tone="moon">{figure.missionCount} MISSIONS</Badge>
        <Badge tone={figure.readings > 1 ? 'accent' : 'night'}>{figure.readings} READINGS</Badge>
        <Badge tone="night">{figure.eventCount} EVENTS</Badge>
        <Badge tone="night">{figure.avatarCount} AVATARS</Badge>
      </div>

      {figure.roles.length > 0 ? (
        <ul className="dk-actors-roles-inline" aria-label={`Roles for ${figure.labelEn}`}>
          {figure.roles.map((role) => (
            <li key={role.roleCode}>
              <Badge tone="cyan">{role.role}</Badge> <code>{role.passageRef}</code>{' '}
              <span className="dk-actors-meta">{role.tradition?.label ?? 'no tradition'}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <SourceEvidence source={figure.source} locale={locale} classPrefix="dk-actors" />
    </li>
  )
}

export function FigureRegistryView({ registry, locale = 'en' }: { registry: FigureRegistry; locale?: Locale }): ReactNode {
  return (
    <div className="dk-actors-stack">
      <StatGrid
        items={[
          { label: 'Figures', value: registry.counts.figures },
          { label: 'Missions', value: registry.counts.missions },
          { label: 'Readings', value: registry.counts.readings },
          { label: 'Competing', value: registry.counts.competingFigures },
          { label: 'Roles', value: registry.counts.roles },
          { label: 'Events', value: registry.counts.events },
          { label: 'Avatars', value: registry.counts.avatars },
        ]}
      />

      <Panel title="Figures" subtitle={registry.identityNotice}>
        <p className="dk-actors-notice" role="note">
          {registry.readingsNotice}
        </p>
        {registry.figures.length === 0 ? (
          <EmptyState title="The registry is empty" hint="Seed the actor tables before projecting figures." />
        ) : (
          <ul className="dk-actors-figures" aria-label="Figure Registry">
            {registry.figures.map((figure) => (
              <FigureCard figure={figure} key={figure.figureCode} locale={locale} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

function EventCard({ event, locale }: { event: ActorEvent; locale: Locale }): ReactNode {
  return (
    <li className="dk-actors-event" data-event-code={event.eventCode} data-chronology={event.chronologyConfidence}>
      <div className="dk-actors-event-head">
        <div>
          <h3 className="dk-actors-event-title">{event.title}</h3>
          <span className="dk-actors-meta">
            <code>{event.eventCode}</code> · {event.eventType}
          </span>
        </div>
        <div className="m-row" style={{ gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={toneFor(CHRONOLOGY_TONE, event.chronologyConfidence)}>{event.chronologyConfidence}</Badge>
          <span className="dk-actors-meta">{event.chronologyLabel}</span>
        </div>
      </div>

      <p className="dk-actors-event-description">{event.description}</p>

      <dl className="dk-actors-facts">
        <dt>Place</dt>
        <dd>
          {event.location ? (
            <span className="dk-actors-location">
              {event.location.name}{' '}
              <Badge tone={toneFor(ACCURACY_TONE, event.location.accuracy)}>{event.location.accuracy}</Badge>
              {event.location.region ? <span className="dk-actors-meta"> · {event.location.region}</span> : null}
              <span className="dk-actors-meta dk-actors-block">{event.location.notes}</span>
            </span>
          ) : (
            'No place is recorded for this event.'
          )}
        </dd>
        <dt>Tradition</dt>
        <dd>
          <TraditionBadge tradition={event.tradition} />
        </dd>
        <dt>Passage</dt>
        <dd>{event.passageRef ? <code>{event.passageRef}</code> : 'No passage reference is recorded.'}</dd>
      </dl>

      <SourceEvidence source={event.source} locale={locale} classPrefix="dk-actors" />
    </li>
  )
}

function ReadingPanel({ detail, locale = 'en' }: { detail: FigureDetail; locale?: Locale }): ReactNode {
  return (
    <Panel
      title="Competing readings"
      subtitle="One panel per tradition and source. Nothing is merged into a single doctrine."
    >
      <p className="dk-actors-notice" role="note" data-merged-doctrine={detail.mergedDoctrine ? 'true' : 'false'}>
        {detail.readingsNotice}
      </p>
      {detail.readings.length === 0 ? (
        <EmptyState title="No mission is recorded" hint="A figure may exist without a sourced mission claim." />
      ) : (
        <div className="dk-actors-readings" data-competing={detail.competingReadings ? 'true' : 'false'}>
          {detail.readings.map((reading) => (
            <section
              className="dk-actors-reading"
              key={reading.tradition?.code ?? 'unknown'}
              data-tradition={reading.tradition?.code ?? ''}
            >
              <header className="dk-actors-reading-head">
                <h3>{reading.tradition?.label ?? 'Unknown tradition'}</h3>
                <TraditionBadge tradition={reading.tradition} />
                <span className="dk-actors-meta">sources: {reading.sourceCodes.join(', ') || 'none'}</span>
              </header>
              <p className="dk-actors-readable">{reading.tradition?.description}</p>
              <ul className="dk-actors-missions">
                {reading.missions.map((mission) => (
                  <MissionCard row={mission} key={mission.missionCode} locale={locale} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Panel>
  )
}

function AvatarPanel({ detail, locale }: { detail: FigureDetail; locale: Locale }): ReactNode {
  const policy: AvatarPolicy = detail.policy
  return (
    <Panel title="Avatar policy" subtitle={policy.notice}>
      <dl className="dk-actors-facts">
        <dt>Proposal</dt>
        <dd>
          {policy.proposal} · <Badge tone="night">{policy.modelStatus}</Badge>
        </dd>
        <dt>Names recovered</dt>
        <dd>{policy.namesRecovered ? 'yes' : 'no — no name is manufactured'}</dd>
        <dt>Seeded names</dt>
        <dd>{policy.seededNames}</dd>
        <dt>Disclosure</dt>
        <dd className="dk-actors-disclosure">{policy.disclosureTemplate}</dd>
      </dl>
      <p className="dk-actors-readable">{policy.sourceNote}</p>
      <ul className="dk-actors-rules">
        {policy.rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>

      <h3 className="dk-actors-subhead">Recorded avatars</h3>
      {detail.avatars.length === 0 ? (
        <EmptyState
          title="No avatar is seeded"
          hint="The 25-avatar list was not recovered, so no name is invented for this milestone."
        />
      ) : (
        <ul className="dk-actors-avatars">
          {detail.avatars.map((avatar) => (
            <li className="dk-actors-avatar" key={avatar.avatarCode} data-avatar-code={avatar.avatarCode}>
              <div className="dk-actors-avatar-head">
                <strong>{avatar.avatarName}</strong>
                <Badge tone={toneFor(AVATAR_TONE, avatar.status)}>{avatar.status}</Badge>
                <Badge tone="night">{avatar.authorityStatus}</Badge>
              </div>
              <p className="dk-actors-readable">{avatar.pedagogicalUse}</p>
              <p className="dk-actors-disclosure">{avatar.disclosure}</p>
              <SourceEvidence source={avatar.source} locale={locale} classPrefix="dk-actors" />
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export function FigureDetailView({ detail, locale = 'en' }: { detail: FigureDetail; locale?: Locale }): ReactNode {
  return (
    <div className="dk-actors-stack">
      <Panel
        title={`${detail.figure.labelEn} · ${detail.figure.figureCode}`}
        subtitle={detail.figure.summary}
        actions={
          <div className="m-row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <Badge tone={toneFor(FIGURE_TONE, detail.figure.figureKind)}>{detail.figure.figureKind}</Badge>
            <Badge tone={toneFor(ATTESTATION_TONE, detail.figure.attestation)}>{detail.figure.attestation}</Badge>
            <Badge tone={toneFor(FIGURE_STATUS_TONE, detail.figure.status)}>{detail.figure.status}</Badge>
          </div>
        }
      >
        <StatGrid
          items={[
            { label: 'Readings', value: detail.counts.readings },
            { label: 'Missions', value: detail.counts.missions },
            { label: 'Roles', value: detail.counts.roles },
            { label: 'Events', value: detail.counts.events },
            { label: 'Avatars', value: detail.counts.avatars },
          ]}
        />
        <p className="dk-actors-notice" role="note">
          {detail.noExclusive.notice}
        </p>
        <SourceEvidence source={detail.figure.source} locale={locale} classPrefix="dk-actors" />
      </Panel>

      <Panel title="Roles" subtitle={detail.roleNotice}>
        {detail.roles.length === 0 ? (
          <EmptyState title="No role is recorded" hint="Absence of a role claim is not a negative identity decision." />
        ) : (
          <ul className="dk-actors-roles" aria-label={`Roles for ${detail.figure.labelEn}`}>
            {detail.roles.map((role) => (
              <RoleRow role={role} key={role.roleCode} locale={locale} />
            ))}
          </ul>
        )}
      </Panel>

      <ReadingPanel detail={detail} locale={locale} />

      <Panel title="Events and chronology" subtitle={detail.chronology.notice}>
        {detail.events.length === 0 ? (
          <EmptyState title="No event is recorded" hint="The registry does not invent an event or a date to fill a gap." />
        ) : (
          <ul className="dk-actors-events" aria-label={`Events for ${detail.figure.labelEn}`}>
            {detail.events.map((event) => (
              <EventCard event={event} key={event.eventCode} locale={locale} />
            ))}
          </ul>
        )}
        <p className="dk-actors-meta">Chronology labels: {detail.chronology.labels.join(' · ')}</p>
      </Panel>

      <AvatarPanel detail={detail} locale={locale} />

      <Panel title="Sources" subtitle="Every claim above cites one of these approved sources.">
        {detail.sources.length === 0 ? (
          <EmptyState title="No approved source" hint="A claim without an approved source is excluded from the projection." />
        ) : (
          <ul className="dk-actors-sources">
            {detail.sources.map((source) => (
              <li key={source.code ?? 'source'}>
                <SourceEvidence source={source} locale={locale} classPrefix="dk-actors" />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
