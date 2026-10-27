import type { OrbitCopyKey } from '../lib/orbit-copy'
import { Badge } from '@moonwitness/moonui'

export interface OrbitNavProps {
  copy: Readonly<Record<OrbitCopyKey, string>>
  activeSection?: string
  viewMode?: 'spatial' | 'accessible'
}

export function OrbitNav({ copy, activeSection = 'overview', viewMode = 'spatial' }: OrbitNavProps) {
  return (
    <nav className="orbit-nav-bar" role="navigation" aria-label="Section Navigation">
      <ul className="orbit-nav-links">
        <li>
          <a
            href="#overview"
            className={`orbit-nav-link ${activeSection === 'overview' ? 'active' : ''}`}
            aria-current={activeSection === 'overview' ? 'page' : undefined}
          >
            {copy.navOverview}
          </a>
        </li>
        <li>
          <a
            href="#workstations"
            className={`orbit-nav-link ${activeSection === 'workstations' ? 'active' : ''}`}
            aria-current={activeSection === 'workstations' ? 'page' : undefined}
          >
            {copy.navWorkstations}
          </a>
        </li>
        <li>
          <a
            href="#agent-loops"
            className={`orbit-nav-link ${activeSection === 'agent-loops' ? 'active' : ''}`}
            aria-current={activeSection === 'agent-loops' ? 'page' : undefined}
          >
            {copy.navAgentLoops}
          </a>
        </li>
        <li>
          <a
            href="#task-queues"
            className={`orbit-nav-link ${activeSection === 'task-queues' ? 'active' : ''}`}
            aria-current={activeSection === 'task-queues' ? 'page' : undefined}
          >
            {copy.navTaskQueues}
          </a>
        </li>
        <li>
          <a
            href="#audit-traces"
            className={`orbit-nav-link ${activeSection === 'audit-traces' ? 'active' : ''}`}
            aria-current={activeSection === 'audit-traces' ? 'page' : undefined}
          >
            {copy.navAuditTraces}
          </a>
        </li>
      </ul>

      <div className="orbit-view-controls">
        <Badge tone={viewMode === 'spatial' ? 'cyan' : 'night'}>
          {copy.viewSpatial}
        </Badge>
        <Badge tone={viewMode === 'accessible' ? 'cyan' : 'night'}>
          {copy.viewAccessible2D}
        </Badge>
      </div>
    </nav>
  )
}
