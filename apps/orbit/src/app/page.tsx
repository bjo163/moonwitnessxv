import { Badge, Card, CardHeader, CardBody } from '@moonwitness/moonui'
import { SIMULATED_OPERATIONS } from '../fixtures/simulated-operations'
import { orbitCopy } from '../lib/orbit-copy'
import { getRequestLocale } from '../lib/request-locale'
import { OrbitShellHeader } from '../components/OrbitShellHeader'
import { OrbitNav } from '../components/OrbitNav'

export interface PageProps {
  searchParams?: Promise<{ locale?: string }>
}

export default async function OrbitPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {}
  const locale = await getRequestLocale(resolvedParams.locale)
  const copy = orbitCopy(locale)

  const {
    connectionStatus,
    dataSource,
    lastSyncTimestamp,
    workstations,
    agents,
    taskQueue,
    recentTraces,
  } = SIMULATED_OPERATIONS

  return (
    <>
      <OrbitShellHeader
        locale={locale}
        copy={copy}
        connectionStatus={connectionStatus}
      />

      <OrbitNav copy={copy} />

      <main className="orbit-main" id="main-content">
        {/* Spatial 3D Viewport Boundary (Target for M40-03 WebGL / R3F scene) */}
        <section
          id="overview"
          className="orbit-spatial-container"
          aria-labelledby="spatial-viewport-heading"
        >
          <div className="orbit-spatial-header">
            <h2 id="spatial-viewport-heading" className="orbit-item-title">
              {copy.viewSpatial}
            </h2>
            <Badge tone="accent">{copy.simulatedStage}</Badge>
          </div>
          <div className="orbit-spatial-viewport">
            <p className="orbit-spatial-callout">
              {copy.spatialViewportNotice}
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge tone="night">{copy.workstationsHeading}: {workstations.length}</Badge>
              <Badge tone="night">{copy.agentLoopsHeading}: {agents.length}</Badge>
              <Badge tone="night">{copy.taskQueuesHeading}: {taskQueue.length}</Badge>
            </div>
          </div>
        </section>

        {/* Accessible 2D Fallback Operation Grid */}
        <section id="workstations" aria-labelledby="accessible-2d-heading">
          <h2
            id="accessible-2d-heading"
            style={{
              marginBottom: '16px',
              fontSize: '1.05rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {copy.accessible2dHeading}
          </h2>

          <div className="orbit-2d-grid">
            {/* Workstations Panel */}
            <Card variant="outline">
              <CardHeader title={copy.workstationsHeading} />
              <CardBody>
                <ul className="orbit-list" aria-label={copy.workstationsHeading}>
                  {workstations.map((ws) => (
                    <li key={ws.id} className="orbit-item">
                      <div className="orbit-item-header">
                        <span className="orbit-item-title">{ws.name}</span>
                        <Badge tone="night">{ws.status}</Badge>
                      </div>
                      <div className="orbit-item-meta">
                        <span>{copy.zoneLabel}: {ws.zone.toUpperCase()}</span>
                        <span>{copy.agentsLabel}: {ws.agentIds.join(', ')}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {/* Agent Loops Panel */}
            <div id="agent-loops">
              <Card variant="outline">
                <CardHeader title={copy.agentLoopsHeading} />
                <CardBody>
                  <ul className="orbit-list" aria-label={copy.agentLoopsHeading}>
                    {agents.map((agent) => (
                      <li key={agent.id} className="orbit-item">
                        <div className="orbit-item-header">
                          <span className="orbit-item-title">{agent.name}</span>
                          <Badge tone={agent.state === 'WAITING_APPROVAL' ? 'accent' : 'ok'}>
                            {agent.state}
                          </Badge>
                        </div>
                        <div className="orbit-item-meta">
                          <span>{copy.roleLabel}: {agent.role}</span>
                        </div>
                        <div className="orbit-item-meta">
                          <span>{copy.cycleLabel}: #{agent.executionCycle}</span>
                          <span>{copy.stepsLabel}: {agent.stepCount}</span>
                          <span>{copy.leaseLabel}: {agent.leaseStatus}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>

            {/* Task Queues Panel */}
            <div id="task-queues">
              <Card variant="outline">
                <CardHeader title={copy.taskQueuesHeading} />
                <CardBody>
                  <ul className="orbit-list" aria-label={copy.taskQueuesHeading}>
                    {taskQueue.map((task) => (
                      <li key={task.id} className="orbit-item">
                        <div className="orbit-item-header">
                          <span className="orbit-item-title">{task.title}</span>
                          <Badge tone={task.priority === 'CRITICAL' ? 'hot' : 'night'}>
                            {task.status}
                          </Badge>
                        </div>
                        <div className="orbit-item-meta">
                          <span>{copy.idLabel}: {task.id}</span>
                          <span>{copy.priorityLabel}: {task.priority}</span>
                        </div>
                        {task.approvalPayload && (
                          <div
                            style={{
                              marginTop: '4px',
                              fontSize: '0.75rem',
                              color: 'var(--accent)',
                            }}
                          >
                            {copy.handoffNotice}: {task.approvalPayload.action} ({task.approvalPayload.requestedRole})
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>

            {/* Event Traces Panel */}
            <div id="audit-traces">
              <Card variant="outline">
                <CardHeader title={copy.auditTracesHeading} />
                <CardBody>
                  <ul className="orbit-list" aria-label={copy.auditTracesHeading}>
                    {recentTraces.map((trace) => (
                      <li
                        key={trace.id}
                        className={`orbit-trace-entry ${trace.level.toLowerCase()}`}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'var(--muted)',
                            fontSize: '0.7rem',
                          }}
                        >
                          <span>[{trace.source}]</span>
                          <time dateTime={trace.timestamp}>
                            {trace.timestamp.split('T')[1]?.replace('Z', '')}
                          </time>
                        </div>
                        <div>{trace.message}</div>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="orbit-footer" role="contentinfo">
        <div>
          {copy.dataSourceLabel}: {dataSource} · {copy.synchronizedLabel}: {lastSyncTimestamp}
        </div>
        <div>{copy.footerNotice}</div>
      </footer>
    </>
  )
}
