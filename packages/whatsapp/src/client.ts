import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { HUB_ORIGIN_DEFAULT, serviceUnavailable } from '@moonwitness/core'
import { pino } from 'pino'
import { EventEmitter } from 'node:events'
import type {
  ConnectionState,
  IncomingMessage,
  MessageHandler,
  WhatsAppClientOptions,
  WhatsAppStatus,
} from './types.js'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/**
 * Bentuk `connection.update` dari Baileys, ditulis di sini sebagai tipe lokal.
 * Paket itu mengekspor tipe kejadian lewat jalur dalam yang tidak stabil antar
 * versi; yang kita butuhkan cuma empat medan, dan `unknown` akan memaksa setiap
 * akses di bawah ini menulis cast sendiri-sendiri.
 */
interface ConnectionUpdate {
  qrcode?: string
  connection?: string
  me?: { id?: string }
  lastDisconnect?: { error?: { output?: { statusCode?: number } } }
}

/**
 * Thin, opinionated wrapper around a Baileys (WhatsApp Web multi-device) socket.
 * Emits: 'qr' (string), 'state' (ConnectionState), 'message' (IncomingMessage).
 */
export class WhatsAppClient extends EventEmitter {
  private readonly log = pino({ level: 'silent' })
  private sock: ReturnType<typeof makeWASocket> | null = null
  private _state: ConnectionState = 'disconnected'
  private _qr?: string
  private _jid?: string
  private connecting = false
  private shouldReconnect = true
  private readonly handler: MessageHandler

  constructor(private readonly opts: WhatsAppClientOptions) {
    super()
    this.handler = this.buildDefaultHandler()
  }

  get status(): WhatsAppStatus {
    return { state: this._state, qr: this._qr, jid: this._jid }
  }

  /** Establish the WhatsApp connection (idempotent). */
  async connect(): Promise<void> {
    if (this.connecting || this._state === 'open') return
    this.connecting = true
    this.shouldReconnect = true
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.opts.authDir)
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: undefined }))

      this.sock = makeWASocket({
        version,
        auth: state,
        logger: this.log,
        printQRInTerminal: false,
        browser: ['Moonwitness', 'chrome', '1.0.0'],
      })

      this.sock.ev.on('creds.update', () => {
        void saveCreds()
      })
      this.sock.ev.on('connection.update', (update) => {
        void this.onConnectionUpdate(update as ConnectionUpdate)
      })
      this.sock.ev.on('messages.upsert', (payload) => {
        // IWebMessageInfo membawa jauh lebih banyak medan daripada IncomingMessage;
        // yang kami jamah hanya key + isi pesan, jadi penyempitan dilakukan sekali
        // di sini alih-alih di setiap pembaca.
        this.onMessages(payload.messages as unknown as IncomingMessage[])
      })

      this.setState('connecting')
    } finally {
      this.connecting = false
    }
  }

  /** Send a plain text message to a chat jid (or a phone number). */
  async sendText(to: string, text: string): Promise<string> {
    if (!this.sock || this._state !== 'open') {
      throw serviceUnavailable('WhatsApp is not connected')
    }
    const jid = to.includes('@') ? to : `${to.replace(/[^0-9]/g, '')}@s.whatsapp.net`
    const sent = await this.sock.sendMessage(jid, { text })
    return sent?.key?.id ?? ''
  }

  /** Terminate the session and delete stored credentials. */
  async logout(): Promise<void> {
    this.shouldReconnect = false
    try {
      await this.sock?.logout()
    } catch {
      /* already offline */
    }
    this.sock?.end(undefined as never)
    this.sock = null
    this._qr = undefined
    this._jid = undefined
    this.setState('logged-out')
  }

  /** Cleanly stop the socket (used on server shutdown). */
  async close(): Promise<void> {
    this.shouldReconnect = false
    this.sock?.end(undefined as never)
    this.sock = null
    this.setState('disconnected')
  }

  // ---- internals -----------------------------------------------------------

  private setState(next: ConnectionState) {
    this._state = next
    this.emit('state', next)
  }

  private async onConnectionUpdate(u: ConnectionUpdate): Promise<void> {
    if (u.qrcode) {
      this._qr = u.qrcode
      this.emit('qr', u.qrcode)
    }
    if (u.connection) {
      if (u.connection === 'open') {
        this._qr = undefined
        this._jid = u.me?.id ?? undefined
        this.setState('open')
      } else if (u.connection === 'close') {
        // Baileys membungkus alasannya sebagai Boom error: error.output.statusCode
        const code = u.lastDisconnect?.error?.output?.statusCode
        const loggedOut = code === DisconnectReason.loggedOut

        this.sock = null
        if (!loggedOut && this.shouldReconnect) {
          this.setState('disconnected')
          await sleep(3000)
          void this.connect()
        } else {
          this.setState(loggedOut ? 'logged-out' : 'disconnected')
        }
      } else {
        this.setState('connecting')
      }
    }
  }

  private onMessages(messages: IncomingMessage[]): void {
    for (const msg of messages) {
      if (msg.key?.fromMe) continue
      this.emit('message', msg)
      void Promise.resolve(this.handler(msg, this)).catch((err) => this.log.error(err))
    }
  }

  /** Interactive radio command handler: replies to ping, help, !np, !stations, !req, !intel, !terms */
  private buildDefaultHandler(): MessageHandler {
    return async (msg, client) => {
      if (!this.opts.bot?.enabled) return
      const rawText = (msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? '').trim()
      const text = rawText.toLowerCase()
      const to = msg.key?.remoteJid
      if (!to) return

      // the hub origin is the shared contract, not a literal: this plugin runs
      // inside the hub process, where the port is decided once
      const hubBase = HUB_ORIGIN_DEFAULT

      if (text === 'ping') {
        await client.sendText(to, 'pong')
        return
      }

      if (text === 'help' || text === '!help') {
        const helpText = [
          'MOONWITNESS RADIO DISPATCH',
          'Available commands:',
          '• !np - Now playing on-air slot & station',
          '• !stations - Top active radio channels',
          '• !req <message> - Send a request to the live studio',
          '• !intel - Latest critical radar signal',
          '• !terms <word> - Lookup concept in UNILEX',
        ].join('\n')
        await client.sendText(to, helpText)
        return
      }

      if (text === '!np') {
        try {
          const res = await fetch(`${hubBase}/api/v1/views/nowPlaying?limit=1`, { signal: AbortSignal.timeout(2000) })
          if (res.ok) {
            const body = (await res.json()) as { data?: Array<{ title?: string; host?: string; stationRefRecord?: { name?: string } }> }
            const slot = body.data?.[0]
            if (slot?.title) {
              const station = slot.stationRefRecord?.name ? ` on ${slot.stationRefRecord.name}` : ''
              const host = slot.host ? ` with ${slot.host}` : ''
              await client.sendText(to, `ON-AIR: ${slot.title}${station}${host}`)
              return
            }
          }
        } catch {
          /* hub unreachable */
        }
        await client.sendText(to, 'ON-AIR: Moonwitness 24/7 Cyberpunk Radio Stream')
        return
      }

      if (text === '!stations') {
        try {
          const res = await fetch(`${hubBase}/api/v1/stations?limit=5&where=${encodeURIComponent(JSON.stringify({ active: true }))}`, { signal: AbortSignal.timeout(2000) })
          if (res.ok) {
            const body = (await res.json()) as { data?: Array<{ name: string; genre?: string }> }
            const lines = (body.data ?? []).map((s) => `• ${s.name} (${s.genre ?? 'Eclectic'})`)
            if (lines.length > 0) {
              await client.sendText(to, `ACTIVE CHANNELS:\n${lines.join('\n')}`)
              return
            }
          }
        } catch {
          /* quiet ignore */
        }
        await client.sendText(to, 'Stations available at: https://moonwitness.media/stations')
        return
      }

      if (text.startsWith('!req ') || text.startsWith('!request ')) {
        const message = rawText.replace(/^!(?:req|request)\s+/i, '').trim()
        if (!message) {
          await client.sendText(to, 'Usage: !req <song or message for DJ>')
          return
        }
        try {
          await fetch(`${hubBase}/api/v1/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, sender: to, status: 'new' }),
            signal: AbortSignal.timeout(3000),
          })
          await client.sendText(to, `Request received: "${message}". Broadcast queued for on-air review!`)
        } catch {
          await client.sendText(to, `Request accepted locally: "${message}"`)
        }
        return
      }

      if (text === '!intel') {
        try {
          const res = await fetch(`${hubBase}/api/v1/monitor_signals?limit=1&order=-urgencyScore`, { signal: AbortSignal.timeout(2000) })
          if (res.ok) {
            const body = (await res.json()) as { data?: Array<{ title: string; urgencyScore: number; platform: string }> }
            const top = body.data?.[0]
            if (top) {
              await client.sendText(to, `CRITICAL INTEL [${top.platform.toUpperCase()} ${top.urgencyScore}%]:\n${top.title}`)
              return
            }
          }
        } catch {
          /* quiet ignore */
        }
        await client.sendText(to, 'Sentinel radar scanning: all sectors nominal.')
        return
      }

      if (text.startsWith('!terms ') || text.startsWith('!term ')) {
        const query = rawText.replace(/^!(?:terms|term)\s+/i, '').trim()
        try {
          const res = await fetch(`${hubBase}/orm/unilex/terms?q=${encodeURIComponent(query)}&limit=1`, { signal: AbortSignal.timeout(2000) })
          if (res.ok) {
            const body = (await res.json()) as { data?: { terms?: Array<{ preferredEn: string; definition: string; stableId: string }> } }
            const term = body.data?.terms?.[0]
            if (term) {
              await client.sendText(to, `UNILEX [${term.stableId}] ${term.preferredEn}:\n${term.definition}`)
              return
            }
          }
        } catch {
          /* quiet ignore */
        }
        await client.sendText(to, `Term "${query}" not found in current approved lexicon.`)
        return
      }

      if (text === '!prisms') {
        await client.sendText(
          to,
          'THE 13 PRISMS OF MOONWITNESS II:\n01 Storytelling\n02 Exposure\n03 Change Advisory Board\n04 Chasing Heart\n05 Lovestruck\n06 Breath Electric\n07 Seduction\n08 Fault Lines\n09 Villain of the Story\n10 Witness Archive\n11 Sanity\'s Last Breath\n12 Past Presence\n13 Promoting\n\nExplore online: https://moonwitness.media/prisms',
        )
        return
      }

      if (text === '!eras') {
        await client.sendText(
          to,
          'THE 8 NARRATIVE ERAS:\n1 Before Light\n2 The Arrival\n3 The Witness\n4 The Runaways\n5 The Exposure\n6 The Change\n7 End of an Era\n8 Next Phase (XV)\n\nExplore timeline: https://moonwitness.media/timeline',
        )
        return
      }

      if (text === '!help') {
        await client.sendText(
          to,
          'MOONWITNESS BOT COMMANDS:\n!np - Currently playing song & station\n!stations - List radio channels\n!req <message> - Send on-air listener request\n!intel - Latest critical radar signal\n!terms <query> - Search Unilex dictionary\n!prisms - 13 Prisms of Moonwitness II\n!eras - 8 Narrative Eras',
        )
        return
      }
    }
  }
}
