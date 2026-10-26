import type { RadioConfig } from '../config.js'

/** Normalized, channel-agnostic connection status. */
export interface ChannelStatus {
  state: 'disconnected' | 'connecting' | 'open' | 'logged-out' | string
  detail?: Record<string, unknown>
}

export interface SendInput {
  to: string
  text: string
}

export interface SendResult {
  channel: string
  to: string
  ok: boolean
  id?: string
  error?: string
}

/**
 * A pluggable instant-messaging channel (WhatsApp, Telegram, ...).
 * Each channel plugin exports a factory returning one of these.
 */
export interface Channel {
  /** Unique id used in the REST path, e.g. "whatsapp". */
  readonly id: string
  /** Human friendly name for docs/UI. */
  readonly label: string
  status(): ChannelStatus | Promise<ChannelStatus>
  send(input: SendInput): Promise<SendResult>
  start?(): Promise<void>
  logout?(): Promise<void>
  /** Release resources on shutdown. */
  shutdown?(): Promise<void>
}

/**
 * A channel factory. Returns a Channel, or `null` to opt out (e.g. when the
 * channel is disabled via config). This is the plugin contract for `src/channels/*`.
 */
export type ChannelFactory = (
  config: RadioConfig,
) => Channel | null | Promise<Channel | null>

/** Registry that holds all active channels and drives send/broadcast. */
export class ChannelManager {
  private readonly channels = new Map<string, Channel>()

  register(channel: Channel): void {
    this.channels.set(channel.id, channel)
  }

  get(id: string): Channel | undefined {
    return this.channels.get(id)
  }

  list(): Channel[] {
    return [...this.channels.values()]
  }

  async statusAll(): Promise<Array<ChannelStatus & { id: string; label: string }>> {
    return Promise.all(
      this.list().map(async (c) => ({ id: c.id, label: c.label, ...(await c.status()) })),
    )
  }

  /** Send to every registered channel (the "radio broadcast"). */
  async broadcast(input: SendInput): Promise<SendResult[]> {
    return Promise.all(
      this.list().map(async (c) => {
        try {
          return await c.send(input)
        } catch (err) {
          return {
            channel: c.id,
            to: input.to,
            ok: false,
            error: (err as Error).message,
          }
        }
      }),
    )
  }

  async shutdownAll(): Promise<void> {
    await Promise.all(this.list().map((c) => c.shutdown?.()))
  }
}
