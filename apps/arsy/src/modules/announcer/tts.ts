/**
 * @moonwitness/arsy — AI Voice DJ "Luna" Dispatcher
 *
 * Formats structured on-air news flash scripts and SSML audio cue frames
 * when critical intelligence signals or breaking alerts arrive.
 */

export interface VoiceFlashCue {
  id: string
  title: string
  urgency: number
  platform: string
  scriptText: string
  ssmlText: string
  timestamp: string
}

export function generateLunaScript(signal: {
  title: string
  urgency: number
  platform: string
  region?: string
}): VoiceFlashCue {
  const urgencyLabel =
    signal.urgency >= 90
      ? 'CRITICAL DEFCON 1'
      : signal.urgency >= 80
        ? 'HIGH PRIORITY'
        : 'ADVISORY'

  const id = `flash-${Date.now()}`
  const now = new Date().toISOString()
  const scriptText = `Station break. This is Moonwitness Luna with an intelligence flash. ${urgencyLabel} signal incoming via ${signal.platform.toUpperCase()}: ${signal.title}. Stay tuned for verification.`

  const ssmlText = `<speak>
    <emphasis level="strong">Station break.</emphasis>
    <p>This is Moonwitness Luna with an on-air intelligence flash.</p>
    <p><emphasis level="moderate">${urgencyLabel}</emphasis> signal detected via ${signal.platform.toUpperCase()}.</p>
    <s>${signal.title}.</s>
    <prosody rate="fast">Stay tuned to the constellation for live verification.</prosody>
  </speak>`

  return {
    id,
    title: signal.title,
    urgency: signal.urgency,
    platform: signal.platform,
    scriptText,
    ssmlText,
    timestamp: now,
  }
}
