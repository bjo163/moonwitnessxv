import type { ReactNode, RefObject } from 'react'
import { CrtBackdrop } from '../crt.js'
import { LiveDot } from '../data.js'
import { Kbd } from '../glyph.js'
import { Badge, Card, CardBody, CardHeader } from '../layout.js'
import { Button } from '../form.js'
import { Pill, PillGroup } from '../pills.js'
import { TerminalViewer, type TerminalLine } from '../terminal.js'
import { TextInput } from '../form.js'

/** Strings arrive resolved; MoonUI never imports an application catalog. */
type SurfaceCopy = Readonly<Record<string, string>>

export function CockpitLedgerView({
  errorLines,
  loadLedger,
  clearLedger,
  copy,
}: {
  errorLines: string[]
  loadLedger: () => Promise<void>
  clearLedger: () => Promise<void>
  copy: SurfaceCopy
}): ReactNode {
  return (
    <div className="tab-content">
      <div className="terminal-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--muted)' }}>
            SOURCE: dev-errors.log
          </span>
          <Badge tone="hot">{errorLines.length} ENTRIES</Badge>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary" size="sm" onClick={() => void loadLedger()}>
            {copy.btnRefresh}
          </Button>
          <Button variant="danger" size="sm" onClick={() => void clearLedger()}>
            {copy.btnClearLedger}
          </Button>
        </div>
      </div>

      <div className="m-terminal-viewer" style={{ flex: 1, maxHeight: 'none' }}>
        {errorLines.length === 0 ? (
          <div style={{ color: 'var(--ok)', padding: 16 }}>{copy.emptyLedger}</div>
        ) : (
          errorLines.map((line, idx) => (
            <div
              key={idx}
              style={{
                padding: '6px 10px',
                background: 'rgba(255, 30, 86, 0.1)',
                borderLeft: '3px solid var(--hot)',
                marginBottom: 6,
                borderRadius: 3,
                color: 'var(--hot)',
              }}
            >
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function CockpitLogsView({
  services,
  filterTag,
  setFilterTag,
  searchTerm,
  setSearchTerm,
  showErrorsOnly,
  setShowErrorsOnly,
  autoScroll,
  setAutoScroll,
  onClearLogs,
  logLines,
  copy,
}: {
  /** Service tags only: the filter never needs the rest of the config. */
  services: Array<{ tag: string }>
  filterTag: string
  setFilterTag: (tag: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  showErrorsOnly: boolean
  setShowErrorsOnly: (val: boolean) => void
  autoScroll: boolean
  setAutoScroll: (val: boolean) => void
  onClearLogs: () => void
  logLines: TerminalLine[]
  copy: SurfaceCopy
}): ReactNode {
  return (
    <div className="tab-content">
      <div className="terminal-bar">
        <PillGroup label="Filter:">
          <Pill
            label={copy.filterAll}
            active={filterTag === 'all'}
            tone="cyan"
            onClick={() => setFilterTag('all')}
          />
          {services.map((service) => (
            <Pill
              key={service.tag}
              label={service.tag.toUpperCase()}
              active={filterTag === service.tag}
              tone={filterTag === service.tag ? 'cyan' : 'night'}
              onClick={() => setFilterTag(service.tag)}
            />
          ))}
        </PillGroup>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TextInput
            style={{ height: 30, fontSize: 12, width: 180 }}
            placeholder={copy.searchLogsPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant={showErrorsOnly ? 'danger' : 'ghost'}
            size="sm"
            onClick={() => setShowErrorsOnly(!showErrorsOnly)}
          >
            {copy.errorsOnly}
          </Button>
          <Button
            variant={autoScroll ? 'cyan' : 'ghost'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
          >
            {copy.autoScroll}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearLogs}>
            {copy.clearLogs}
          </Button>
        </div>
      </div>

      <TerminalViewer lines={logLines} autoScroll={autoScroll} className="flex-1" />
    </div>
  )
}

export interface CockpitPortRow {
  tag: string
  name: string
  port?: number
  url?: string
  running: boolean
  worker: boolean
}

/** Port cards: the surface derives the rows, MoonUI owns the card anatomy. */
export function CockpitPortsView({
  rows,
  openPreview,
  copy,
}: {
  rows: CockpitPortRow[]
  openPreview: (url: string) => void
  copy: SurfaceCopy
}): ReactNode {
  return (
    <div className="ports-container">
      {rows.map((row) => (
        <Card key={row.tag} style={{ backgroundColor: 'var(--surface-2)' }}>
          <CardHeader
            title={
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 24,
                  fontWeight: 900,
                  color: 'var(--cyan)',
                }}
              >
                {row.worker ? copy.workerNoPort : `:${String(row.port)}`}
              </span>
            }
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LiveDot state={row.running ? 'live' : 'down'} />
                <Badge tone={row.running ? 'ok' : 'night'}>
                  {row.running ? copy.statusBound : copy.statusIdle}
                </Badge>
              </div>
            }
          />
          <CardBody>
            <div style={{ fontWeight: 800, color: 'var(--fg)', fontSize: 14, marginBottom: 4 }}>
              {row.name}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 14 }}>
              {row.tag.toUpperCase()}
            </div>
            {!row.worker && row.url ? (
              <Button variant="primary" size="sm" onClick={() => openPreview(row.url as string)}>
                {copy.btnOpenPreview}
              </Button>
            ) : null}
          </CardBody>
        </Card>
      ))}
    </div>
  )
}

/** A supervised service as the sidebar needs it. */
export interface CockpitService {
  tag: string
  name: string
  pkg?: string
  port?: number
  url?: string
  type?: string
  icon?: string
  color?: string
  description?: string
}

export interface CockpitServiceState {
  status: string
  uptimeSeconds: number
  pid?: number
  port?: number
  lastErrorCode?: string
  lastErrorPort?: number
  lastError?: string
}

/** Service cards with the localized status and failure sentence. */
export function CockpitSidebar({
  services,
  serviceStates,
  controlService,
  openPreview,
  formatUptime,
  copy,
}: {
  services: CockpitService[]
  serviceStates: Record<string, CockpitServiceState>
  controlService: (tag: string, action: 'start' | 'stop' | 'restart') => Promise<void>
  openPreview: (url: string) => void
  formatUptime: (seconds: number) => string
  copy: SurfaceCopy
}): ReactNode {
  return (
    <aside className="cockpit-sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">{copy.microservices}</span>
        <Badge tone="cyan">{copy.liveControl}</Badge>
      </div>

      <div className="services-list">
        {services.map((svc) => {
          const state: CockpitServiceState = serviceStates[svc.tag] ?? {
            status: 'STOPPED',
            uptimeSeconds: 0,
          }
          const isRunning = state.status === 'RUNNING'
          const badgeTone =
            state.status === 'RUNNING'
              ? 'ok'
              : state.status === 'STARTING'
                ? 'accent'
                : state.status === 'ERROR'
                  ? 'hot'
                  : 'night'

          const statusText =
            state.status === 'RUNNING'
              ? copy.statusOnline
              : state.status === 'STARTING'
                ? copy.statusStarting
                : state.status === 'ERROR'
                  ? copy.statusError
                  : copy.statusOffline

          // Localize the failure from the machine-readable code; never render the
          // server's raw English sentence as operator copy.
          const errorPort = String(state.lastErrorPort ?? state.port ?? '?')
          const errorText =
            state.status === 'ERROR' && state.lastErrorCode === 'PORT_BUSY'
              ? (copy.errPortBusy ?? '').replace('{port}', errorPort)
              : state.status === 'ERROR' && state.lastErrorCode === 'PORT_NOT_RELEASED'
                ? (copy.errPortNotReleased ?? '').replace('{port}', errorPort)
                : state.status === 'ERROR' && state.lastErrorCode === 'SPAWN_FAILED'
                  ? (copy.errSpawnFailed ?? '').replace('{reason}', state.lastError ?? '')
                  : null

          return (
            <div key={svc.tag} className="service-card-wrapper">
              <Card
                style={{
                  borderLeft: `4px solid ${svc.color ?? 'var(--border)'}`,
                  backgroundColor: 'var(--surface-2)',
                }}
              >
                <CardHeader
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{svc.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--fg)' }}>
                        {svc.name}
                      </span>
                    </div>
                  }
                  actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <LiveDot
                        state={
                          state.status === 'RUNNING'
                            ? 'live'
                            : state.status === 'ERROR'
                              ? 'down'
                              : 'connecting'
                        }
                      />
                      <Badge tone={badgeTone}>{statusText}</Badge>
                    </div>
                  }
                />
                <CardBody style={{ paddingTop: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--muted)',
                      marginBottom: 6,
                    }}
                  >
                    {svc.port ? (
                      <span>
                        {copy.port}: <b style={{ color: 'var(--cyan)' }}>{svc.port}</b>
                      </span>
                    ) : (
                      <span>TYPE: WORKER</span>
                    )}
                    {state.pid ? (
                      <span>
                        {copy.pid}: <b style={{ color: 'var(--fg)' }}>{state.pid}</b>
                      </span>
                    ) : null}
                    {state.uptimeSeconds > 0 ? (
                      <span>
                        {copy.uptime}:{' '}
                        <b style={{ color: 'var(--ok)' }}>{formatUptime(state.uptimeSeconds)}</b>
                      </span>
                    ) : null}
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.35 }}>
                    {svc.description}
                  </div>

                  {errorText ? (
                    <div role="alert" style={{ fontSize: 11, color: 'var(--hot)', marginBottom: 8, lineHeight: 1.35 }}>
                      {errorText}
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {isRunning ? (
                      <>
                        <Button variant="danger" size="sm" onClick={() => void controlService(svc.tag, 'stop')}>
                          {copy.actionStop}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => void controlService(svc.tag, 'restart')}>
                          {copy.actionRestart}
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" size="sm" onClick={() => void controlService(svc.tag, 'start')}>
                        {copy.actionStart}
                      </Button>
                    )}
                    {svc.url ? (
                      <Button
                        variant="paper"
                        size="sm"
                        onClick={() => {
                          if (svc.url) openPreview(svc.url)
                        }}
                      >
                        {copy.actionPreview}
                      </Button>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

/** Command footer with the shortcut legend and the optional CRT shader layer. */
export function CockpitFooter({
  crtShader,
  copy,
  onOpenHelp,
}: {
  crtShader: boolean
  copy: SurfaceCopy
  onOpenHelp: () => void
}): ReactNode {
  return (
    <>
      <footer
        className="cockpit-footer"
        style={{
          minHeight: 28,
          background: 'var(--ink)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          zIndex: 20,
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>
            <Kbd>Space</Kbd> {copy.shortcutPlayPause}
          </span>
          <span>
            <Kbd>M</Kbd> {copy.shortcutMute}
          </span>
          <span>
            <Kbd>[</Kbd> / <Kbd>]</Kbd> {copy.shortcutChannel}
          </span>
          <span>
            <Kbd>1</Kbd>–<Kbd>6</Kbd> {copy.shortcutTabs}
          </span>
          <span>
            <Kbd>P</Kbd> {copy.shortcutPorts}
          </span>
          <button
            type="button"
            onClick={onOpenHelp}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'var(--cyan)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={copy.shortcutHelp}
          >
            <Kbd>?</Kbd> {copy.shortcutHelp}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>{copy.runtimeInfo}</span>
          <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>MS-EDGE / VITE</span>
        </div>
      </footer>

      {/* CRT Phosphor Scanline Shader Layer */}
      {crtShader ? (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
          <CrtBackdrop scanlines vignette tint="cyan" />
        </div>
      ) : null}
    </>
  )
}

/** Preview pane: address bar, shortcuts and the framed target. */
export function CockpitPreviewView({
  shortcuts,
  previewUrl,
  setPreviewUrl,
  openPreview,
  frameRef,
  copy,
}: {
  shortcuts: Array<{ label: string; url: string }>
  previewUrl: string
  setPreviewUrl: (url: string) => void
  openPreview: (url: string) => void
  frameRef: RefObject<HTMLIFrameElement | null>
  copy: SurfaceCopy
}): ReactNode {
  const navigate = () => {
    if (frameRef.current) frameRef.current.src = previewUrl
  }
  return (
    <div className="tab-content">
      <div className="preview-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 500 }}>
          <TextInput
            style={{ height: 32, fontSize: 12, flex: 1, color: 'var(--cyan)' }}
            value={previewUrl}
            onChange={(e) => setPreviewUrl(e.target.value)}
            placeholder={copy.urlPlaceholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate()
            }}
          />
          <Button variant="primary" size="sm" onClick={navigate}>
            {copy.go}
          </Button>
          <Button variant="ghost" size="sm" onClick={navigate}>
            {copy.reload}
          </Button>
          <Button variant="paper" size="sm" onClick={() => window.open(previewUrl, '_blank')}>
            {copy.externalWindow}
          </Button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {shortcuts.map((s) => (
            <Button
              key={s.url}
              variant="ghost"
              size="sm"
              style={{ fontSize: 11, padding: '3px 8px' }}
              onClick={() => openPreview(s.url)}
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      <iframe ref={frameRef} className="preview-iframe" src={previewUrl} title={copy.iframeTitle} />
    </div>
  )
}
