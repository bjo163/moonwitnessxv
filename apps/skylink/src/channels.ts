import type { TelegramAdapter } from '@moonwitness/skylink-telegram'

export interface SkylinkChannelStatus {
  state: string
  detail?: Record<string, unknown>
}

export interface SkylinkSendResult {
  providerMessageId?: string
  status: 'accepted' | 'failed'
  error?: string
}

/** Minimal provider-facing channel boundary consumed by SKYLINK's control plane. */
export interface SkylinkChannel {
  readonly id: string
  readonly label: string
  readonly channelAccountId: string
  status(): SkylinkChannelStatus | Promise<SkylinkChannelStatus>
  send(input: { to: string; text: string }): Promise<SkylinkSendResult>
  start?(): Promise<void>
  logout?(): Promise<void>
  on?(event: 'qr', listener: (qr: string) => void): unknown
  off?(event: 'qr', listener: (qr: string) => void): unknown
}

export class DuplicateSkylinkChannelIdError extends Error {
  readonly code = 'SKYLINK_DUPLICATE_CHANNEL_ID'

  constructor(id: string) {
    super(`SKYLINK channel id is already registered: ${id}`)
    this.name = 'DuplicateSkylinkChannelIdError'
  }
}

export class SkylinkChannelRegistry {
  private readonly channels = new Map<string, SkylinkChannel>()

  register(channel: SkylinkChannel): void {
    if (this.channels.has(channel.id)) throw new DuplicateSkylinkChannelIdError(channel.id)
    this.channels.set(channel.id, channel)
  }

  get(id: string): SkylinkChannel | undefined {
    return this.channels.get(id)
  }

  list(): SkylinkChannel[] {
    return [...this.channels.values()]
  }
}

/** Adapt the Telegram transport to the control-plane channel contract. */
export function createTelegramSkylinkChannel(adapter: TelegramAdapter, channelAccountId: string): SkylinkChannel {
  return {
    id: 'telegram',
    label: 'Telegram',
    channelAccountId,
    status: () => ({ state: adapter.status.state }),
    send: async ({ to, text }) => {
      try {
        const result = await adapter.sendText(to, text)
        return { status: result.status, providerMessageId: result.providerMessageId }
      } catch {
        return { status: 'failed' }
      }
    },
    start: () => adapter.start(),
    logout: () => adapter.stop(),
  }
}
