import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Alert, Button, EmptyState, PageHeader, Panel, Pill, SplitView, Stat, TextInput } from '@moonwitness/moonui'
import { AlertDialog } from '@moonwitness/moonui/client'
import { controlChannel, fetchChannels, fetchConversations, fetchDeliveryAttempts, fetchMessages, openOperatorSocket, type Channel, type Conversation, type DeliveryAttempt, type Message } from './lib/api.js'

type SocketState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'idle'
type StreamEvent = Record<string, unknown> & { type?: string; channelId?: string; qr?: string; timestamp?: string }

export function App(): ReactNode {
  const [draft, setDraft] = useState('')
  const [token, setToken] = useState('')
  const [channels, setChannels] = useState<Channel[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [deliveryAttempts, setDeliveryAttempts] = useState<DeliveryAttempt[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [socketState, setSocketState] = useState<SocketState>('idle')
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pending, setPending] = useState<{ channel: Channel; action: 'start' | 'logout' } | null>(null)

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId)
  const currentQr = useMemo(() => events.find((event) => event.type === 'channel.qr' && event.channelId && typeof event.qr === 'string'), [events])

  const refresh = useCallback(async (session: string, signal: AbortSignal) => {
    const [channelResponse, conversationResponse] = await Promise.all([
      fetchChannels(session, signal), fetchConversations(session, signal),
    ])
    setChannels(channelResponse.data)
    setConversations(conversationResponse.data)
    setSelectedId((current) => current || conversationResponse.data[0]?.id || '')
  }, [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    let socket: WebSocket | null = null
    setError('')
    void refresh(token, controller.signal).then(() => {
      if (controller.signal.aborted) return
      socket = openOperatorSocket(token, {
        onState: setSocketState,
        onEvent: (event) => setEvents((existing) => [event as StreamEvent, ...existing].slice(0, 30)),
      })
    }).catch((cause: unknown) => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'SKYLINK could not be reached.')
    })
    return () => { controller.abort(); socket?.close(); setSocketState('idle') }
  }, [token, refresh])

  useEffect(() => {
    if (!token || !selectedId) { setMessages([]); return }
    const controller = new AbortController()
    void Promise.all([
      fetchMessages(selectedId, token, controller.signal),
      fetchDeliveryAttempts(selectedId, token, controller.signal),
    ])
      .then(([messageResponse, attemptResponse]) => {
        setMessages(messageResponse.data)
        setDeliveryAttempts(attemptResponse.data)
      })
      .catch((cause: unknown) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Messages could not be loaded.') })
    return () => controller.abort()
  }, [token, selectedId])

  async function runControl(): Promise<void> {
    if (!pending || !token) return
    const request = pending
    setPending(null)
    setBusy(true)
    setError('')
    const controller = new AbortController()
    try {
      await controlChannel(request.channel.id, request.action, token, controller.signal)
      await refresh(token, controller.signal)
      if (request.action === 'logout') setEvents((existing) => existing.filter((event) => !(event.type === 'channel.qr' && event.channelId === request.channel.id)))
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Channel action failed.') }
    finally { setBusy(false) }
  }

  function endSession(): void {
    setToken('')
    setDraft('')
    setChannels([]); setConversations([]); setMessages([]); setDeliveryAttempts([]); setEvents([]); setSelectedId('')
  }

  return (
    <div className="skylink-shell">
      <header className="skylink-header">
        <PageHeader title="SKYLINK // Operator Inbox" subtitle="D18 messages and channels · existing ARSY operator session" />
        <div className="skylink-auth">
          <TextInput type="password" aria-label="ARSY session bearer token" placeholder="ARSY session token (memory only)" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') setToken(draft.trim()) }} />
          <Button variant="primary" onClick={() => setToken(draft.trim())} disabled={!draft.trim()}>Use session</Button>
          {token ? <Button variant="ghost" onClick={endSession}>End session</Button> : null}
          <span className="skylink-session" aria-live="polite">{token ? 'Session held in memory.' : 'No session — protected data is not requested.'}</span>
        </div>
      </header>

      <section className="skylink-strip" aria-label="Service and channel status">
        <Stat label="WebSocket" value={socketState} hint="Authenticated event stream" />
        {channels.length ? channels.map((channel) => <Stat key={channel.id} label={channel.label} value={channel.state} hint={`Channel state · ${channel.id}`} />) : <Stat label="Channels" value={token ? 'loading' : 'not connected'} hint="Actual provider state appears after authentication." />}
      </section>

      {error ? <div role="alert"><Alert tone="hot">{error}</Alert></div> : null}
      <main className="skylink-main">
        <SplitView leftRatio="34%" left={
          <Panel title="Inbox" subtitle={`${String(conversations.length)} recent conversations`}>
            {!token ? <EmptyState title="Connect an ARSY session" hint="Enter an existing operator bearer token to load channels and conversations." /> : conversations.length === 0 ? <EmptyState title="No conversations" hint="SKYLINK returned no recent conversations." /> : <ul className="skylink-list" aria-label="Conversations">{conversations.map((conversation) => <li key={conversation.id}><button type="button" className={`skylink-conversation${selectedId === conversation.id ? ' is-selected' : ''}`} aria-current={selectedId === conversation.id ? 'true' : undefined} onClick={() => setSelectedId(conversation.id)}><span className="skylink-conversation-title">{conversation.title || conversation.externalId}</span><span className="skylink-meta">{conversation.status} · {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleString() : 'No message time'}</span></button></li>)}</ul>}
          </Panel>
        } right={
          <div className="skylink-detail-grid">
            <Panel title={selectedConversation?.title || selectedConversation?.externalId || 'Conversation'} subtitle={selectedConversation ? `Channel account ${selectedConversation.channelAccountId} · ${selectedConversation.status}` : 'Choose a conversation'}>
              {messages.length ? <ol className="skylink-messages" aria-label="Messages">{messages.map((message) => <li key={message.id} className={`skylink-message is-${message.direction}`}><div className="skylink-message-head"><Pill label={message.direction} /><span>{message.status}</span><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time></div><p>{message.body}</p></li>)}</ol> : <EmptyState title={selectedConversation ? 'No messages in this conversation' : 'Inbox detail'} hint="Messages shown here are read from the authenticated SKYLINK API." />}
            </Panel>
            <div className="skylink-side-stack">
              <Panel title="Channel pairing" subtitle="Pairing data is visible only to this authenticated operator session.">
                {channels.length ? <div className="skylink-channel-controls">{channels.map((channel) => <div className="skylink-channel" key={channel.id}><div><strong>{channel.label}</strong><span className="skylink-meta">State: {channel.state}</span></div><div className="skylink-actions"><Button variant="ghost" disabled={busy || !token} onClick={() => setPending({ channel, action: 'start' })}>Start / pair</Button><Button variant="danger" disabled={busy || !token} onClick={() => setPending({ channel, action: 'logout' })}>Log out</Button></div></div>)}</div> : <EmptyState title="No channel controls" hint="Connect to SKYLINK to inspect registered provider channels." />}
                {currentQr ? <div className="skylink-qr" aria-live="polite"><strong>Pairing payload · {String(currentQr.channelId)}</strong><code tabIndex={0}>{String(currentQr.qr)}</code><Button variant="ghost" onClick={() => setEvents((existing) => existing.filter((event) => event !== currentQr))}>Dismiss pairing data</Button></div> : null}
              </Panel>
              <Panel title="Delivery attempts" subtitle="Bounded attempt history from D18.">
                {deliveryAttempts.length ? <ul className="skylink-delivery" aria-label="Delivery attempts">{deliveryAttempts.map((attempt) => <li key={attempt.id}><span>Attempt {String(attempt.attemptNumber)} · {new Date(attempt.attemptedAt).toLocaleString()}</span><Pill label={attempt.status} /></li>)}</ul> : <EmptyState title="No delivery attempts" hint="No attempts are recorded for this conversation." />}
              </Panel>
              <Panel title="Recent events" subtitle={`Authenticated WebSocket · ${socketState}`}>
                {events.length ? <ul className="skylink-events" aria-live="polite">{events.slice(0, 8).map((event, index) => <li key={`${String(event.timestamp)}-${String(event.type)}-${String(index)}`}><Pill label={String(event.type || 'event')} /><span>{String(event.channelId || event.conversationId || '')}</span><time>{event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : ''}</time></li>)}</ul> : <p className="skylink-meta">No events received in this session.</p>}
              </Panel>
            </div>
          </div>
        } />
      </main>

      {pending ? <AlertDialog isOpen title={`${pending.action === 'logout' ? 'Log out' : 'Start / pair'} ${pending.channel.label}?`} message={pending.action === 'logout' ? 'This changes the provider session and clears any pairing payload from this screen.' : 'This starts the provider and may create a pairing request visible in this authenticated session.'} confirmLabel={pending.action === 'logout' ? 'Log out channel' : 'Start channel'} cancelLabel="Cancel" tone={pending.action === 'logout' ? 'danger' : 'accent'} onConfirm={() => void runControl()} onClose={() => setPending(null)} /> : null}
    </div>
  )
}
