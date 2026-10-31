import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CockpitTopBar } from '../dist/client/index.js'
import { LocaleToggleGroup } from '../dist/index.js'

const copy = {
  brandTitle: 'MOONWITNESS COCKPIT',
  brandSubtitle: 'MISSION SUPERVISOR // LOCAL ENGINE',
  telemetrySysClock: 'SYS CLOCK',
  telemetryUptime: 'UPTIME',
  telemetryStatus: 'STATUS',
  telemetryTodo: 'TODO',
  supervised: 'SUPERVISED',
  quickPlayerPlay: 'Play quick audio stream',
  quickPlayerPause: 'Pause audio stream',
  quickPlayerMute: 'Mute audio',
  quickPlayerUnmute: 'Unmute audio',
  quickPlayerVolume: 'Volume',
  muteButton: 'MUTE',
  volumeButton: 'VOL',
  rackButton: 'RACK',
  tabMedia: 'MEDIA',
  startAllRefused: '{count} refused',
  startAll: 'START ALL',
  stopAll: 'STOP ALL',
  freePorts: 'FREE PORTS',
  crtFilter: 'CRT SCANLINES',
  crtFilterActive: 'CRT ACTIVE',
  selectLanguage: 'Select interface language',
  shortcutChannel: 'Prev/Next Channel',
  shortcutHelp: 'Help & Shortcuts Guide',
}

const localeOptions = [
  { value: 'id', label: 'ID' },
  { value: 'en', label: 'EN' },
]

function renderBar(overrides: Record<string, unknown> = {}): string {
  return renderToStaticMarkup(
    React.createElement(CockpitTopBar, {
      clock: '10:00:00',
      uptime: 42,
      isPlaying: true,
      currentChannel: { type: 'iptv', name: 'DW News English HD', genre: 'News', icon: 'DW' },
      prevChannel: () => {},
      togglePlayPause: () => {},
      nextChannel: () => {},
      isMuted: false,
      toggleMuted: () => {},
      volume: 0.6,
      setVolume: () => {},
      openMediaTab: () => {},
      startAll: () => {},
      isStartingAll: false,
      startAllSummary: null,
      stopAll: () => {},
      freePorts: () => {},
      isFreeingPorts: false,
      crtShader: false,
      toggleCrtShader: () => {},
      progressPercent: 61,
      locale: 'en',
      localeOptions,
      setLocale: () => {},
      copy,
      onOpenHelp: () => {},
      ...overrides,
    }),
  )
}

describe('CockpitTopBar', () => {
  it('renders the four groups the bar is built from', () => {
    const html = renderBar()
    assert.match(html, /<header class="cockpit-topbar">/)
    for (const group of ['cockpit-brand', 'cockpit-telemetry', 'cockpit-rack', 'cockpit-actions']) {
      assert.ok(html.includes(`class="${group}"`), `missing group: ${group}`)
    }
  })

  it('labels every telemetry readout from the injected copy', () => {
    const html = renderBar()
    for (const label of ['SYS CLOCK', 'UPTIME', 'STATUS', 'TODO', 'SUPERVISED']) {
      assert.ok(html.includes(label), `telemetry label missing: ${label}`)
    }
    assert.ok(html.includes('42s'), 'uptime carries its unit')
    assert.ok(html.includes('61%'), 'the register percentage is rendered')
  })

  it('states a telemetry value with data-tone, never a class assembled from data', () => {
    assert.match(renderBar({ progressPercent: null }), /data-tone="muted">—</)
    assert.match(renderBar({ progressPercent: 7 }), /data-tone="cyan">7%/)
    assert.match(renderBar(), /data-tone="ok">SUPERVISED/)
    assert.doesNotMatch(renderBar(), /cockpit-telemetry-value-\w+/)
  })

  it('moves the rack, the slider and the value colours out of inline styles', () => {
    const html = renderBar()
    // The bar's own anatomy is moon.css now; only its primitives may carry style.
    for (const fragment of [
      /style="[^"]*max-width:\s*440px/,
      /style="[^"]*accent-color/,
      /style="[^"]*padding:\s*2px 5px/,
      /style="[^"]*color:\s*var\(--ok\)/,
      /style="[^"]*font-size:\s*11px/,
    ]) {
      assert.doesNotMatch(html, fragment, `an inline style belongs in moon.css: ${fragment.source}`)
    }
    assert.doesNotMatch(html, /#fff/, 'no colour literal in the design system')
    assert.match(html, /<span class="cockpit-rack-channel"/)
    assert.match(html, /class="cockpit-rack-volume"[^>]*aria-label="Volume"/)
  })

  it('shows the mute state as a word and the refusal count as a badge', () => {
    assert.match(renderBar({ isMuted: true }), />MUTE</)
    assert.match(renderBar({ isMuted: false }), />VOL</)
    assert.doesNotMatch(renderBar(), /refused/)
    assert.match(
      renderBar({ startAllSummary: { success: false, refused: 3, results: [] } }),
      /data-tone="hot"[^>]*>3 refused</,
    )
  })

  it('offers the language choice through the shared toggle group', () => {
    const html = renderBar()
    assert.match(html, /<div class="m-locale-toggle" role="group" aria-label="Select interface language">/)
    assert.equal((html.match(/m-locale-toggle-option/g) ?? []).length, 2)
    assert.match(html, /aria-pressed="false"[^>]*>ID/)
    assert.match(html, /aria-pressed="true"[^>]*>EN/)
    assert.doesNotMatch(html, /aria-pressed="true"[^>]*>ID/)
  })
})

describe('LocaleToggleGroup', () => {
  it('marks the active language with aria-pressed only', () => {
    const html = renderToStaticMarkup(
      React.createElement(LocaleToggleGroup, {
        label: 'Pilih bahasa antarmuka',
        value: 'id',
        options: localeOptions,
        onChange: () => {},
      }),
    )
    assert.match(html, /role="group" aria-label="Pilih bahasa antarmuka"/)
    assert.match(html, /aria-pressed="true"[^>]*>ID</)
    assert.match(html, /aria-pressed="false"[^>]*>EN</)
    for (const button of html.match(/<button[^>]*>/g) ?? []) {
      assert.match(button, /type="button"/)
    }
  })

  it('renders one option per choice, in the order the app supplied', () => {
    const html = renderToStaticMarkup(
      React.createElement(LocaleToggleGroup, {
        label: 'Language',
        value: 'de',
        options: [
          { value: 'de', label: 'DE' },
          { value: 'fr', label: 'FR' },
          { value: 'it', label: 'IT' },
        ],
        onChange: () => {},
      }),
    )
    assert.equal((html.match(/m-locale-toggle-option/g) ?? []).length, 3)
    assert.match(html, /aria-pressed="true"[^>]*>DE</)
    assert.ok(html.indexOf('>DE<') < html.indexOf('>FR<'), 'option order is the caller\'s')
  })
})
