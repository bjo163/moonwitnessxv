import { ADMIN_WRITE, defineAddon, defineModel, defineView, sel, str, text } from '@moonwitness/moonql'

/**
 * moonql-settings — typed key/value application settings.
 * Field-renaming showcase: the public `uiSettings` view re-exposes
 * key/value as settingKey/settingValue, filtered to client-safe groups,
 * while raw writes stay admin-only.
 */
export const settings = defineAddon({
  name: 'settings',
  version: '1.0.0',
  models: {
    settings_entries: defineModel({
      label: 'Setting',
      rest: true,
      fields: {
        key: str({ maxLength: 80 }),
        // 'announce' is the on-air desk: switches a DJ may flip while streaming,
        // deliberately absent from `uiSettings` because a listener must not be able
        // to read (let alone infer) whether the request queue is open.
        group: sel(['player', 'ui', 'system', 'announce'], { default: 'player' }),
        value: text(),
        note: str({ maxLength: 200, null: true }),
      },
      unique: [['key']],
      acl: ADMIN_WRITE,
      menu: { group: 'System', icon: '⚙️', order: 50 },
      seed: [
        { key: 'volume', group: 'player', value: '0.8', note: 'default player volume' },
        { key: 'theme', group: 'ui', value: 'moon-dark', note: 'neo-brutalist dark palette' },
        { key: 'autoplay', group: 'player', value: 'true' },
        { key: 'crossfade_sec', group: 'player', value: '2' },
        { key: 'language', group: 'ui', value: 'en', note: 'client UI language (ISO 639-1)' },
        { key: 'sidebar_collapsed', group: 'ui', value: 'false' },
        { key: 'max_recent_tracks', group: 'ui', value: '25' },
        { key: 'log_level', group: 'system', value: 'info' },
        { key: 'stream_timeout_ms', group: 'system', value: '15000' },
        { key: 'recordings_retention_days', group: 'system', value: '30' },
        { key: 'requests_open', group: 'announce', value: 'true', note: 'queue DENPA transmissions as listener requests' },
        // The announcer module stays silent until a destination exists, so an empty
        // value here is the real default rather than a placeholder: no messenger is
        // configured on a fresh install.
        { key: 'announce_to', group: 'announce', value: '', note: 'channel destination for request and failure alerts' },
        { key: 'announce_requests', group: 'announce', value: 'true', note: 'broadcast each new listener request' },
      ],
    }),
  },
  views: {
    uiSettings: defineView('uiSettings', {
      label: 'Client-facing settings',
      from: 'settings_entries',
      select: { settingKey: 'key', settingValue: 'value' },
      where: { group: { in: ['ui', 'player'] } },
      order: 'key',
      limit: 50,
      menu: { group: 'Radio', order: 50 },
    }),
  },
})

export default settings
