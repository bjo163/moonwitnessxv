import type { ChannelItem } from '../types'
import type { CockpitCopyCatalog } from '../lib/cockpit-copy'

/**
 * Media transport state machine (UI2-P18a / P18b / P18d).
 *
 * Everything in this module is a pure function so it can be unit-tested with
 * `tsx --test` (the cockpit has no DOM harness). App.tsx owns the DOM; this
 * module owns the *meaning* of a state, so the UI can never render "NOMINAL"
 * where the player is actually silent, blocked or unsupported.
 */

/** Every state the cockpit's transport can honestly be in. */
export type MediaStatusCode =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'stopped'
  | 'blocked'
  | 'unsupported-hls'
  | 'error'
  | 'no-video-surface'
  | 'unknown'

export type MediaTone = 'ok' | 'warn' | 'danger' | 'muted'

/** How a channel will actually be played, given what the browser offers. */
export type MediaPlanKind = 'iptv-hls' | 'iptv-native' | 'iptv-direct' | 'audio' | 'unsupported-hls'

export interface MediaEnvironment {
  /** hls.js can run here (MSE available). */
  hlsSupported: boolean
  /** The video element natively plays m3u8 (Safari). */
  nativeHls: boolean
}

/** An HLS asset is recognised by its manifest extension, not by the tab. */
export function isHlsUrl(url: string): boolean {
  return /\.m3u8(?:$|\?)/i.test(url)
}

/**
 * Map a channel to the playback path that will really be taken.
 * Every `iptv-*` plan needs a mounted <video>, and the caller must check that
 * before starting anything: this function describes capability, not mounting.
 * Returns 'unsupported-hls' instead of silently doing nothing — the old
 * engine's missing `else` branch meant a click appeared to do nothing at all.
 */
export function planChannelPlayback(
  channel: Pick<ChannelItem, 'type' | 'streamUrl'>,
  env: MediaEnvironment,
): MediaPlanKind {
  if (channel.type !== 'iptv') return 'audio'
  if (!isHlsUrl(channel.streamUrl)) return 'iptv-direct'
  if (env.hlsSupported) return 'iptv-hls'
  if (env.nativeHls) return 'iptv-native'
  return 'unsupported-hls'
}

/**
 * Channel cycling with honest empty-rack behaviour.
 * `(i + 1) % 0` is NaN, which used to make the active channel undefined;
 * an empty rack now stays put at index 0 instead of poisoning the index.
 */
export function cycleChannelIndex(current: number, length: number, delta: number): number {
  if (length <= 0) return 0
  return ((current + delta) % length + length) % length
}

export function isActiveStatus(code: MediaStatusCode): boolean {
  return code === 'playing' || code === 'buffering'
}

/**
 * Why did `element.play()` reject?
 * These are three different truths and must not share a label:
 * - 'blocked'  the browser refused autoplay; one user gesture fixes it.
 * - 'aborted'  a newer play/pause/src change superseded this request, so the
 *              stream is fine and nothing actually went wrong.
 * - 'error'    the resource itself failed.
 */
export function classifyPlayRejection(err: unknown): 'blocked' | 'aborted' | 'error' {
  const name = (err as { name?: string } | null | undefined)?.name
  if (name === 'NotAllowedError') return 'blocked'
  if (name === 'AbortError') return 'aborted'
  return 'error'
}

/**
 * HTML5 `MediaError.code` → locale-invariant machine token.
 * The raw code stays visible on purpose: translating a diagnostic string
 * would make it impossible to correlate with the server log.
 */
export function mediaElementErrorToken(code: number | undefined): string | null {
  switch (code) {
    case 1:
      return 'ABORTED'
    case 2:
      return 'NETWORK'
    case 3:
      return 'DECODE'
    case 4:
      return 'SRC_NOT_SUPPORTED'
    default:
      return null
  }
}

/** hls.js `data.details` → a short machine token, untranslated by design. */
export function hlsErrorToken(details: string | undefined, fatal: boolean): string {
  const d = (details ?? '').toUpperCase()
  const prefix = fatal ? 'FATAL' : 'WARN'
  if (!d) return `${prefix}/UNKNOWN`
  return `${prefix}/${d}`
}

/** A human detail line: raw token if we have one, honest "nothing reported" if not. */
export function describeMediaFailure(
  token: string | null,
  copy: CockpitCopyCatalog,
): string {
  return token ?? copy.mediaNoReason
}

/**
 * The single place a status code becomes a label + tone.
 * No branch here may upgrade silence to health: an unmapped code renders
 * 'STATE UNKNOWN', never 'PLAYING'.
 */
export function describeMediaStatus(
  code: MediaStatusCode,
  copy: CockpitCopyCatalog,
): { label: string; tone: MediaTone; hint: string | null } {
  switch (code) {
    case 'playing':
      return { label: copy.statusPlaying, tone: 'ok', hint: null }
    case 'paused':
      return { label: copy.statusPaused, tone: 'muted', hint: null }
    case 'loading':
      return { label: copy.statusLoading, tone: 'warn', hint: null }
    case 'buffering':
      return { label: copy.statusBuffering, tone: 'warn', hint: null }
    case 'stopped':
      return { label: copy.statusStopped, tone: 'muted', hint: null }
    case 'idle':
      return { label: copy.statusStopped, tone: 'muted', hint: null }
    case 'blocked':
      return { label: copy.statusBlocked, tone: 'warn', hint: copy.mediaBlockedHint }
    case 'unsupported-hls':
      return { label: copy.statusUnsupported, tone: 'danger', hint: null }
    case 'error':
      return { label: copy.statusError, tone: 'danger', hint: null }
    case 'no-video-surface':
      return { label: copy.statusNoSurface, tone: 'warn', hint: null }
    case 'unknown':
    default:
      return { label: copy.statusUnknown, tone: 'danger', hint: null }
  }
}

/** Transport codes that imply audio/video is actually moving. */
export function statusFromElementEvent(
  event: 'play' | 'playing' | 'pause' | 'waiting' | 'stalled' | 'ended' | 'error',
): MediaStatusCode {
  switch (event) {
    case 'playing':
      return 'playing'
    case 'play':
      return 'loading'
    case 'waiting':
    case 'stalled':
      return 'buffering'
    case 'pause':
      return 'paused'
    case 'ended':
      return 'stopped'
    case 'error':
      return 'error'
  }
}

/** PiP availability, asked of the browser rather than assumed. */
export function pipAvailability(doc: Document | undefined): { enabled: boolean; active: boolean } {
  const d = doc as unknown as (Document & { pictureInPictureEnabled?: boolean; pictureInPictureElement?: Element }) | undefined
  return {
    enabled: Boolean(d?.pictureInPictureEnabled),
    active: Boolean(d?.pictureInPictureElement),
  }
}
