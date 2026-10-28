import { redirect } from 'next/navigation'
import { Alert, Badge, DataTable, PageHeader, Panel } from '@moonwitness/moonui'
import { me } from '@/data/queries/session'
import { decideAccess } from '@/lib/authz'
import { requestLocale } from '@/lib/request-locale'
import {
  EMPTY_SHADOW_STORE,
  SHADOW_AUTHOR_ROLES,
  SHADOW_DRAFT_ACCESS_ROLES,
  canOpenShadowWorkspace,
  describeWorkspace,
  type ShadowCaller,
  type ShadowDraftRef,
} from '@/lib/shadow-editor'
import { AccessDenied } from '@/ui/widgets/AccessDenied'
import { shadowCopy, shadowInterpolate } from './locale-copy'

interface RuleRow {
  key: string
  rule: string
  value: string
}

/**
 * M17-05 SHADOW workspace, hosted inside Headquarters (M33-02 `HOST-HQ`).
 *
 * This page reads no story records because there is no D07 store yet: it renders
 * the empty, honest draft state and the single permission contract every future
 * draft route must call. The session and the role gate are HQ's existing
 * server-side ones — no second login, no client-side authorization, and no
 * publish control anywhere on this screen.
 */
export default async function ShadowWorkspacePage() {
  const locale = await requestLocale()
  const copy = shadowCopy(locale)

  // Same server-side session/ACL boundary as every other HQ private route.
  const access = await decideAccess(() => me(), (user) => canOpenShadowWorkspace(user))
  if (access.status === 'deny') {
    if (access.code === 'anonymous') redirect('/login?error=expired')
    return <AccessDenied code={access.code} />
  }

  const user = access.user
  // ARSY `/auth/me` only ever resolves a human login, so the kind is explicit
  // here rather than inferred: a future non-human credential cannot reuse it.
  const caller: ShadowCaller = {
    authenticated: true,
    actor: { id: user.id, role: user.role, kind: 'human' },
  }
  // The contract filters by ownership/grant; this deployment has no persisted
  // store, so the honest state is the empty one.
  const workspace = describeWorkspace(EMPTY_SHADOW_STORE, caller)

  const rules: RuleRow[] = [
    {
      key: 'author',
      rule: copy.ruleAuthor,
      value: shadowInterpolate(copy.ruleAuthorValue, { roles: SHADOW_AUTHOR_ROLES.join(', ') }),
    },
    {
      key: 'access',
      rule: copy.ruleAccess,
      value: shadowInterpolate(copy.ruleAccessValue, { roles: SHADOW_DRAFT_ACCESS_ROLES.join(', ') }),
    },
    { key: 'owner', rule: copy.ruleOwner, value: copy.ruleOwnerValue },
    { key: 'grant', rule: copy.ruleGrant, value: copy.ruleGrantValue },
    { key: 'revision', rule: copy.ruleRevision, value: copy.ruleRevisionValue },
    { key: 'publish', rule: copy.rulePublish, value: copy.rulePublishValue },
  ]

  const drafts: ShadowDraftRef[] = workspace.drafts.map((draft) => ({
    id: draft.id,
    revision: draft.revision,
  }))

  return (
    <div className="m-stack">
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: copy.hq, href: '/' }, { label: copy.title }]}
        actions={<Badge tone="cyan">{user.role}</Badge>}
      />

      <Alert tone="accent">{copy.persistenceNotice}</Alert>

      <div className="m-grid m-grid-2">
        <Panel title={copy.session} subtitle={copy.sessionSubtitle}>
          <div className="m-stack" style={{ gap: 8 }}>
            <div className="m-row" style={{ justifyContent: 'space-between', gap: 12 }}>
              <span className="m-muted">{copy.account}</span>
              <span className="m-mono">{user.displayName}</span>
            </div>
            <div className="m-row" style={{ justifyContent: 'space-between', gap: 12 }}>
              <span className="m-muted">{copy.role}</span>
              <Badge tone="cyan">{user.role}</Badge>
            </div>
            <div className="m-row" style={{ justifyContent: 'space-between', gap: 12 }}>
              <span className="m-muted">{copy.authoring}</span>
              <span className="m-row" style={{ gap: 6 }}>
                <Badge tone={workspace.canAuthor ? 'ok' : 'night'}>
                  {workspace.canAuthor ? copy.authoringAllowed : copy.authoringDenied}
                </Badge>
                {workspace.authoringReason ? (
                  <span className="m-mono" style={{ fontSize: 11 }}>
                    {copy.reason}: {workspace.authoringReason}
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        </Panel>

        <Panel title={`${copy.drafts} (${drafts.length})`} subtitle={copy.draftsSubtitle}>
          <DataTable
            rows={drafts}
            rowKey={(row) => row.id}
            empty={copy.noDrafts}
            columns={[
              {
                key: 'id',
                label: copy.draft,
                render: (row) => <span className="m-mono">{row.id}</span>,
              },
              {
                key: 'revision',
                label: copy.revision,
                align: 'right',
                render: (row) => <span className="m-mono">{row.revision}</span>,
              },
            ]}
          />
          <p className="m-muted" style={{ fontSize: 12, marginTop: 8 }}>
            {copy.noDraftsNote}
          </p>
        </Panel>
      </div>

      <Panel title={copy.rules} subtitle={copy.rulesSubtitle}>
        <DataTable
          rows={rules}
          rowKey={(row) => row.key}
          columns={[
            { key: 'rule', label: copy.ruleColumn },
            { key: 'value', label: copy.valueColumn },
          ]}
        />
      </Panel>
    </div>
  )
}
