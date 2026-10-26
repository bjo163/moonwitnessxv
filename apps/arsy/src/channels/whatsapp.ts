import { HUB_ORIGIN_DEFAULT } from '@moonwitness/core'
import { WhatsAppClient } from '@moonwitness/skylink-whatsapp'
import type { MessageHandler } from '@moonwitness/skylink-whatsapp'
import type { Channel, ChannelFactory, SendResult } from '../lib/channels.js'
import type { RadioConfig } from '../config.js'

/**
 * WhatsApp channel plugin (Baileys multi-device).
 * This is the "first plugin" of the radio hub: it wraps the WhatsAppClient and
 * adapts it to the generic Channel contract. Returns null when disabled.
 */
const createWhatsAppChannel: ChannelFactory = (config: RadioConfig): Channel | null => {
  const cfg = config.channels.whatsapp
  if (!cfg.enabled) return null

  const messageHandler: MessageHandler = async (message, sender) => {
    if (!cfg.botEnabled || message.fromMe) return
    const rawText = message.text.trim()
    const text = rawText.toLowerCase()
    const to = message.remoteJid
    const api = `${HUB_ORIGIN_DEFAULT}${config.api.prefix}`
    const send = (value: string) => sender.sendText(to, value)
    if (text === 'ping') return void (await send('pong'))
    if (text === 'help' || text === '!help') {
      return void (await send(['MOONWITNESS RADIO DISPATCH', 'Available commands:', '• !np - Now playing on-air slot & station', '• !stations - Top active radio channels', '• !req <message> - Send a request to the live studio', '• !intel - Latest critical radar signal', '• !terms <word> - Lookup concept in UNILEX', '• !prisms - Explore the 13 Prisms', '• !eras - Explore the narrative eras'].join('\n')))
    }
    if (text === '!np') {
      try {
        const res = await fetch(`${api}/views/nowPlaying?limit=1`, { signal: AbortSignal.timeout(2000) })
        if (res.ok) {
          const body = await res.json() as { data?: Array<{ title?: string; host?: string; stationRefRecord?: { name?: string } }> }
          const slot = body.data?.[0]
          if (slot?.title) return void (await send(`ON-AIR: ${slot.title}${slot.stationRefRecord?.name ? ` on ${slot.stationRefRecord.name}` : ''}${slot.host ? ` with ${slot.host}` : ''}`))
        }
      } catch { /* hub unreachable */ }
      return void (await send('ON-AIR: Moonwitness 24/7 Cyberpunk Radio Stream'))
    }
    if (text === '!stations') {
      try {
        const res = await fetch(`${api}/stations?limit=5&where=${encodeURIComponent(JSON.stringify({ active: true }))}`, { signal: AbortSignal.timeout(2000) })
        if (res.ok) {
          const body = await res.json() as { data?: Array<{ name: string; genre?: string }> }
          const lines = (body.data ?? []).map((station) => `• ${station.name} (${station.genre ?? 'Eclectic'})`)
          if (lines.length) return void (await send(`ACTIVE CHANNELS:\n${lines.join('\n')}`))
        }
      } catch { /* quiet ignore */ }
      return void (await send('Stations available at: https://moonwitness.media/stations'))
    }
    if (text.startsWith('!req ') || text.startsWith('!request ')) {
      const request = rawText.replace(/^!(?:req|request)\s+/i, '').trim()
      if (!request) return void (await send('Usage: !req <song or message for DJ>'))
      try {
        await fetch(`${api}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: request, sender: to, status: 'new' }), signal: AbortSignal.timeout(3000) })
        await send(`Request received: "${request}". Broadcast queued for on-air review!`)
      } catch { await send(`Request accepted locally: "${request}"`) }
      return
    }
    if (text === '!intel') {
      try {
        const res = await fetch(`${api}/monitor_signals?limit=1&order=-urgencyScore`, { signal: AbortSignal.timeout(2000) })
        if (res.ok) {
          const body = await res.json() as { data?: Array<{ title: string; urgencyScore: number; platform: string }> }
          const signal = body.data?.[0]
          if (signal) return void (await send(`CRITICAL INTEL [${signal.platform.toUpperCase()} ${signal.urgencyScore}%]:\n${signal.title}`))
        }
      } catch { /* quiet ignore */ }
      return void (await send('Sentinel radar scanning: all sectors nominal.'))
    }
    if (text.startsWith('!terms ') || text.startsWith('!term ')) {
      const query = rawText.replace(/^!(?:terms|term)\s+/i, '').trim()
      try {
        const res = await fetch(`${api}/orm/unilex/terms?q=${encodeURIComponent(query)}&limit=1`, { signal: AbortSignal.timeout(2000) })
        if (res.ok) {
          const body = await res.json() as { data?: { terms?: Array<{ preferredEn: string; definition: string; stableId: string }> } }
          const term = body.data?.terms?.[0]
          if (term) return void (await send(`UNILEX [${term.stableId}] ${term.preferredEn}:\n${term.definition}`))
        }
      } catch { /* quiet ignore */ }
      return void (await send(`Term "${query}" not found in current approved lexicon.`))
    }
    if (text === '!prisms') return void (await send('THE 13 PRISMS OF MOONWITNESS II:\n01 Storytelling\n02 Exposure\n03 Change Advisory Board\n04 Chasing Heart\n05 Lovestruck\n06 Breath Electric\n07 Seduction\n08 Fault Lines\n09 Villain of the Story\n10 Witness Archive\n11 Sanity\'s Last Breath\n12 Past Presence\n13 Promoting\n\nExplore online: https://moonwitness.media/prisms'))
    if (text === '!eras') return void (await send('THE 8 NARRATIVE ERAS:\n1 Before Light\n2 The Arrival\n3 The Witness\n4 The Runaways\n5 The Exposure\n6 The Change\n7 End of an Era\n8 Next Phase (XV)\n\nExplore timeline: https://moonwitness.media/timeline'))
  }

  const client = new WhatsAppClient({
    authDir: cfg.authDir,
    autoConnect: cfg.autoConnect,
    messageHandler,
  })
  if (cfg.autoConnect) void client.connect()

  return {
    id: 'whatsapp',
    label: 'WhatsApp',

    status: () => ({
      state: client.status.state,
      detail: { jid: client.status.jid, qr: client.status.qr },
    }),

    send: async ({ to, text }): Promise<SendResult> => {
      const id = await client.sendText(to, text)
      return { channel: 'whatsapp', to, ok: true, id }
    },

    start: () => client.connect(),
    logout: () => client.logout(),
    shutdown: () => client.close(),
  }
}

export default createWhatsAppChannel
