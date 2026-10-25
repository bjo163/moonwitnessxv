import {
  makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { serviceUnavailable } from '@moonwitness/core'
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
        this.onMessages((payload as { messages?: IncomingMessage[] }).messages ?? [])
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

  /** A tiny built-in bot: replies to "ping" and "help". */
  private buildDefaultHandler(): MessageHandler {
    return async (msg, client) => {
      if (!this.opts.bot?.enabled) return
      const text = (msg.message?.conversation ?? msg.message?.extendedTextMessage?.text ?? '')
        .trim()
        .toLowerCase()
      const to = msg.key?.remoteJid
      if (!to) return

      if (text === 'ping') await client.sendText(to, 'pong 🏓')
      else if (text === 'help') await client.sendText(to, this.opts.bot.greeting ?? 'Moonwitness WhatsApp bot is online.')
    }
  }
}
