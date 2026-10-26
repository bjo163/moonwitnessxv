import type { ReactNode } from 'react'
import {
  Badge,
  BrandLogo,
  Breadcrumbs,
  Button,
  Crown,
  TextInput,
  UserChip,
  ZineNote,
  MoonAvatar,
  type NavGroup,
} from '@moonwitness/moonui'
import { MtsTelemetryClock } from '@moonwitness/moonui/client'
import { getSchema } from '@/data/schema'
import { menuGroups } from '@/data/queries/registry'
import type { SessionUser } from '@/data/types'
import { SideNav } from '@/ui/client/SideNav'

const MISSION_GROUP: NavGroup = {
  label: 'Mission Control',
  items: [
    { key: 'mc:dashboard', label: 'Dashboard', href: '/#telemetry', icon: 'DB' },
    { key: 'mc:mission-control', label: 'Mission Control', href: '/', icon: 'MC' },
    { key: 'mc:project-universe', label: 'Project Universe', href: '/#project-universe', icon: 'PU' },
    { key: 'mc:story-forge', label: 'Story Forge', href: '/models', icon: 'SF' },
    { key: 'mc:poster-lab', label: 'Poster Lab', href: '/views', icon: 'PL' },
    { key: 'mc:research-lab', label: 'Research Lab', href: '/models/monitor_radars', icon: 'RL' },
    { key: 'mc:world-monitor', label: 'World Monitor', href: '/world-monitor', icon: 'WM' },
    { key: 'mc:publishing-hub', label: 'Publishing Hub', href: '/models/scheduleSlot', icon: 'PH' },
    { key: 'mc:settings', label: 'Settings', href: '/system', icon: 'ST' },
  ],
}

/**
 * Mission Control shell (Image 4): punk-zine sidebar powered by `@moonwitness/moonui`
 * (`BrandLogo`, `SideNav`/`Nav`, `ZineNote`), top command bar (`Breadcrumbs`,
 * `TextInput`, `Badge`, `UserChip`, `Button`), and the main page canvas.
 */
export async function VerticalLayout({ user, children }: { user: SessionUser; children: ReactNode }) {
  const doc = await getSchema()
  const groups = [MISSION_GROUP, ...menuGroups(doc)]

  return (
    <div className="m-shell">
      <aside className="m-sidebar">
        <BrandLogo
          href="/"
          size="md"
          subtitle={
            <span className="m-row" style={{ justifyContent: 'space-between', width: '100%' }}>
              <span>EMPIRE OF THE LIGHT · A-L-L-A-H</span>
            </span>
          }
        />

        <SideNav groups={groups} />

        <div className="hq-sidebar-zine" aria-hidden="true">
          <ZineNote tone="dark" tilt="none">
            DIFFERENT PEOPLE · SAME SKY · STORIES BEYOND BORDERS.
          </ZineNote>
          <div>
            <img src="/art/manga-eye.jpg" alt="" className="hq-sidebar-eye" />
            <ZineNote tone="pink" tilt="left">
              WITNESS THE REAL.
            </ZineNote>
          </div>
        </div>

        <div className="m-muted" style={{ fontSize: 10 }}>
          <div>
            {doc.addons.length} addons · {Object.keys(doc.models).length} models
          </div>
          <div>
            {doc.crons.length} crons · {doc.endpoints.length} endpoints
          </div>
        </div>
      </aside>

      <div className="m-main">
        <header className="m-navbar">
          <div className="m-row" style={{ gap: 10 }}>
            <Crown tone="cyan" size="sm" />
            <Breadcrumbs items={[{ label: 'The Empire', href: '/' }, { label: 'Mission Control' }]} />
            <Badge tone="ok">{doc.addons.find((addon) => addon.name === 'ops') ? 'ops online' : 'hub'}</Badge>
          </div>

          <form action="/models" method="get" className="hq-search-form">
            <TextInput
              name="q"
              icon="FIND"
              placeholder="Search projects, stories, research, or people..."
              aria-label="Search projects, stories, research, or people"
            />
          </form>

          <div className="m-row" style={{ gap: 12, alignItems: 'center' }}>
            <MtsTelemetryClock compact />

            <a href="/#alerts" className="m-row" style={{ textDecoration: 'none', gap: 4 }} aria-label="Mission alerts">
              <span className="m-mono m-muted">ALERTS</span>
              <Badge tone="pink">3</Badge>
            </a>

            <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
              <MoonAvatar seed={user.displayName || 'commander'} variant="crown" size={26} />
              <UserChip name={user.displayName} detail={`${user.role} // Empire`} />
            </div>

            <form action="/api/session" method="post">
              <input type="hidden" name="logout" value="1" />
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </header>

        <main className="m-content">{children}</main>
      </div>
    </div>
  )
}
