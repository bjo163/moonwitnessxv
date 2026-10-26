import type { CapturedSignalInput } from './types.js'

export interface WebhookConfig {
  discordWebhookUrl?: string
  telegramBotToken?: string
  telegramChatId?: string
  minUrgencyForAlert?: number
  hqBaseUrl?: string
}

export interface WebhookDispatchResult {
  discordSent: boolean
  telegramSent: boolean
  skipped: boolean
  error?: string
}

/**
 * Multi-Channel Webhook Dispatcher for Critical Sentinel Intelligence
 */
export async function dispatchCriticalAlert(
  signal: CapturedSignalInput,
  radarName: string,
  config: WebhookConfig,
): Promise<WebhookDispatchResult> {
  const minUrgency = config.minUrgencyForAlert ?? 80
  const urgency = signal.urgencyScore ?? 0

  if (urgency < minUrgency && signal.sentiment !== 'critical' && signal.sentiment !== 'alert') {
    return { discordSent: false, telegramSent: false, skipped: true }
  }

  const hqBase = config.hqBaseUrl ?? 'http://127.0.0.1:3002'
  const worldMonitorUrl = `${hqBase}/world-monitor`

  let discordSent = false
  let telegramSent = false

  // 1. Dispatch to Discord Webhook
  if (config.discordWebhookUrl) {
    try {
      const color = urgency >= 90 ? 0xff007a : 0xffd400 // Pink or Gold
      const payload = {
        username: 'Sentinel Watcher',
        avatar_url: 'https://raw.githubusercontent.com/bjo163/moonwitnessxv/main/apps/dock/public/favicon.svg',
        embeds: [
          {
            title: `[INTEL FLASH] ${signal.title}`,
            url: signal.url || worldMonitorUrl,
            description: signal.summary || 'Critical telemetry captured by autonomous Sentinel node.',
            color,
            fields: [
              { name: 'Radar Zone', value: radarName, inline: true },
              { name: 'Urgency Score', value: `${urgency}%`, inline: true },
              { name: 'Platform', value: ((signal as { platform?: string }).platform || 'OSINT').toUpperCase(), inline: true },
            ],
            footer: { text: 'Moonwitness Sentinel OSINT Engine' },
            timestamp: new Date().toISOString(),
          },
        ],
      }

      const res = await fetch(config.discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      })
      discordSent = res.ok
    } catch {
      discordSent = false
    }
  }

  // 2. Dispatch to Telegram Bot
  if (config.telegramBotToken && config.telegramChatId) {
    try {
      const text = `🚨 *[INTEL FLASH ${urgency}%]*\n\n*${signal.title}*\n\n📡 Radar: _${radarName}_\n🌐 Source: ${signal.url || 'Internal'}\n🔗 [View in World Monitor](${worldMonitorUrl})`
      const url = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
        signal: AbortSignal.timeout(4000),
      })
      telegramSent = res.ok
    } catch {
      telegramSent = false
    }
  }

  return { discordSent, telegramSent, skipped: false }
}
