import type { ReactNode } from 'react'
import { cookies, headers } from 'next/headers'
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
} from '@moonwitness/moonui'
import { MtsTelemetryClock } from '@moonwitness/moonui/client'
import { getSchema } from '@/data/schema'
import { menuGroups } from '@/data/queries/registry'
import type { SessionUser } from '@/data/types'
import { SideNav } from '@/ui/client/SideNav'
import { LocaleSelector } from '@/ui/client/LocaleSelector'
import { DOCK_URL } from '@/lib/env'
import {
  demoAlertStatusLabel,
  missionControlGroup,
  operationalStatusLabel,
  resolveShellLocale,
  shellCopy,
} from '@/lib/shell-copy'

/**
 * Mission Control shell (Image 4): punk-zine sidebar powered by `@moonwitness/moonui`
 * (`BrandLogo`, `SideNav`/`Nav`, `ZineNote`), top command bar (`Breadcrumbs`,
 * `TextInput`, `Badge`, `UserChip`, `Button`), and the main page canvas.
 *
 * Shell chrome, navigation labels and operational statuses come from the shared
 * `shell-copy` catalog (M19-21, same mechanism as the M19-20 login catalog).
 * The `mc:*` keys, hrefs and monogram icons are stable route identifiers and are
 * intentionally never localized; the schema-derived groups from `menuGroups` are
 * model metadata owned by M19-22.
 */
export async function VerticalLayout({ user, children }: { user: SessionUser; children: ReactNode }) {
  const doc = await getSchema()
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()])
  const locale = resolveShellLocale({
    persistedLocale: requestCookies.get('mw_locale')?.value,
    acceptLanguage: requestHeaders.get('accept-language'),
  })
  const copy = shellCopy(locale)

  const groups = [missionControlGroup(locale), ...menuGroups(doc)]

  const opsAddon = doc.addons.find((addon) => addon.name === 'ops')

  return (
    <div className="m-shell" lang={locale}>
      <aside className="m-sidebar">
        <BrandLogo
          href="/"
          size="md"
          subtitle={
            <span className="m-row" style={{ justifyContent: 'space-between', width: '100%' }}>
              <span>{copy.brandSubtitle} · A-L-L-A-H</span>
            </span>
          }
        />

        <SideNav groups={groups} locale={locale} />

        <div className="hq-sidebar-zine" aria-hidden="true">
          <ZineNote tone="dark" tilt="none">
            {copy.zineDifferentPeople}
          </ZineNote>
          <div>
            <img src="/art/manga-eye.jpg" alt="" className="hq-sidebar-eye" />
            <ZineNote tone="pink" tilt="left">
              {copy.zineWitnessReal}
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
            <Breadcrumbs
              items={[{ label: copy.breadcrumbEmpire, href: '/' }, { label: copy.breadcrumbMissionControl }]}
            />
            <Badge tone="ok">
              {operationalStatusLabel(locale, {
                source: 'live',
                status: opsAddon ? 'statusOpsLoaded' : 'statusHubFallback',
              })}
            </Badge>
          </div>

          <form action="/models" method="get" className="hq-search-form">
            <TextInput
              name="q"
              icon="FIND"
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchLabel}
            />
          </form>

          <div className="m-row" style={{ gap: 12, alignItems: 'center' }}>
            <MtsTelemetryClock compact />
            <LocaleSelector locale={locale} />
            {DOCK_URL ? <a href={DOCK_URL}>Dock</a> : null}

            <a
              href="/#alerts"
              className="m-row"
              style={{ textDecoration: 'none', gap: 4 }}
              aria-label={demoAlertStatusLabel(locale, 3)}
            >
              <span className="m-mono m-muted">{copy.alertsLink}</span>
              <Badge tone="pink">3 · DEMO</Badge>
            </a>

            <div className="m-row" style={{ gap: 8, alignItems: 'center' }}>
              <MoonAvatar seed={user.displayName || 'commander'} variant="crown" size={26} />
              <UserChip name={user.displayName} detail={`${user.role} // ${copy.userScope}`} />
            </div>

            <form action="/api/session" method="post">
              <input type="hidden" name="logout" value="1" />
              <Button type="submit" variant="ghost" size="sm">
                {copy.logOut}
              </Button>
            </form>
          </div>
        </header>

        <main className="m-content">{children}</main>
      </div>
    </div>
  )
}
