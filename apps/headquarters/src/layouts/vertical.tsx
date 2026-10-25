import type { ReactNode } from 'react'
import { UserChip } from '@moonwitness/moonui'
import { getSchema } from '@/data/schema'
import { menuGroups } from '@/data/queries/registry'
import type { SessionUser } from '@/data/types'
import { SideNav } from '@/ui/client/SideNav'

/**
 * Vuexy-style shell: dark grouped sidebar generated from `_schema.menu`,
 * a navbar with the session chip and logout, then the page content.
 */
export async function VerticalLayout({ user, children }: { user: SessionUser; children: ReactNode }) {
  const doc = await getSchema()
  const groups = menuGroups(doc)

  return (
    <div className="m-shell">
      <aside className="m-sidebar">
        <a href="/" className="m-brand">
          MOON<span>WITNESS</span> HQ
        </a>
        <SideNav groups={groups} />
        <div style={{ marginTop: 'auto', fontSize: 11, opacity: 0.55 }}>
          <div>
            {doc.addons.length} addons · {Object.keys(doc.models).length} models
          </div>
          <div>{doc.crons.length} crons · {doc.endpoints.length} endpoints</div>
        </div>
      </aside>
      <div className="m-main">
        <header className="m-navbar">
          <div className="m-row">
            <strong>Command center</strong>
            <span className="m-muted">
              moonql {doc.addons.find((addon) => addon.name === 'ops') ? '· ops online' : ''}
            </span>
          </div>
          <div className="m-row">
            <UserChip name={user.displayName} detail={user.role} />
            <form action="/api/session" method="post">
              <input type="hidden" name="logout" value="1" />
              <button className="m-btn" data-variant="ghost">
                Log out
              </button>
            </form>
          </div>
        </header>
        <main className="m-content">{children}</main>
      </div>
    </div>
  )
}
