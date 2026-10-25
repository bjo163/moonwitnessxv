import { probeStream } from '@moonwitness/core'
import { ADMIN_WRITE, bool, computed, defineAddon, defineModel, defineView, int, m2o, str, ts } from '@moonwitness/moonql'

/**
 * The radio addon — the ENTIRE stations feature in one declarative file.
 * moonql derives: the `stations` table (+id/createdAt/updatedAt),
 * validation & serialization schemas, the repository, the
 * /api/v1/stations CRUD routes (rest: true) and unique-name enforcement.
 *
 * Ships 36 REAL public stations (30 Indonesia, 6 international) with
 * '@countries:<code>' references that resolve when @moonwitness/moonql-base is
 * installed (null + warn if not). Stream URLs are third-party public endpoints
 * checked on 2026-10-25 (`curl -sIL <url>` must answer audio/*); if one moves,
 * point it at the broadcaster's new endpoint or set `active: false`.
 * Names are the natural key the schedule/playlog seeds reference, so the
 * catalog grows by adding rows — never by renaming an existing station.
 */
export default defineAddon({
  name: 'radio',
  models: {
    stations: defineModel({
      label: 'Station',
      fields: {
        name: str({ maxLength: 120 }),
        streamUrl: str({ format: 'uri' }),
        genre: str({ maxLength: 60, null: true, index: true }),
        countryRef: m2o('countries', { null: true, index: true }),
        active: bool({ default: true }),
        // Probe results (Fase 3.1). Deliberately *not* folded into `active`:
        // flipping that would republish the public catalog on a network blip, and
        // one station is off-air on purpose. A human still decides `active`.
        lastCheckedAt: ts({ null: true }),
        probeOk: bool({ null: true }),
        probeFails: int({ default: 0 }),
        // computed showcase: read-only, never stored, always in responses
        statusLabel: computed({
          type: 'string',
          deps: ['active', 'probeOk'],
          get: (row) =>
            row.active === false ? 'off' : row.probeOk === false ? 'degraded' : 'live',
        }),
      },
      unique: [['name']],
      rest: true,
      // The catalog is public to read but admin-only to change: it feeds the
      // stream URLs both frontends play, so anonymous writes are not acceptable.
      acl: ADMIN_WRITE,
      menu: { group: 'Radio', icon: '🎚️', order: 5 },
      seed: [
        // ---- Indonesia · Jakarta ----
        { name: 'Prambors FM Jakarta', streamUrl: 'https://stream.rcs.revma.com/h77wwp48kxcwv', genre: 'pop', countryRef: '@countries:id' },
        { name: 'Gen FM 98.7 Jakarta', streamUrl: 'https://ic.mari.co.id:8443/genfm', genre: 'pop', countryRef: '@countries:id' },
        { name: 'Hard Rock FM 87.6 Jakarta', streamUrl: 'https://stream.radiojar.com/7csmg90fuqruv', genre: 'rock', countryRef: '@countries:id' },
        { name: 'I-Radio 101.4 Jakarta', streamUrl: 'https://stream.radiojar.com/4ywdgup3bnzuv', genre: 'pop', countryRef: '@countries:id' },
        { name: 'Delta FM 99.1 Jakarta', streamUrl: 'https://stream.rcs.revma.com/k02rmq48kxcwv', genre: 'pop', countryRef: '@countries:id' },
        { name: 'Female Radio 95.9 Jakarta', streamUrl: 'https://stream.rcs.revma.com/9thenqqd2ncwv', genre: 'pop', countryRef: '@countries:id' },
        { name: 'Mustang FM 88.0 Jakarta', streamUrl: 'https://ic.mari.co.id:8443/mustangfm', genre: 'rock', countryRef: '@countries:id' },
        { name: 'Most FM 105.8 Jakarta', streamUrl: 'https://ic.mari.co.id:8443/mostfm', genre: 'pop', countryRef: '@countries:id' },
        { name: 'JAK FM 101.0 Jakarta', streamUrl: 'https://ic.mari.co.id:8443/jakfm', genre: 'pop', countryRef: '@countries:id' },
        { name: 'RDI 97.1 Jakarta', streamUrl: 'http://202.147.199.99:8000/;stream/1', genre: 'dangdut', countryRef: '@countries:id' },
        { name: 'PAS FM 92.4 Jakarta', streamUrl: 'https://i.klikhost.com/8266/stream', genre: 'news', countryRef: '@countries:id' },
        { name: 'RRI Pro 1 Jakarta 91.2', streamUrl: 'https://stream-node1.rri.co.id/streaming/25/9025/rrijakartapro1.mp3', genre: 'news', countryRef: '@countries:id' },
        { name: 'RRI Pro 3 KBRN', streamUrl: 'https://stream-node0.rri.co.id/streaming/14/9014/kbrn.mp3', genre: 'news', countryRef: '@countries:id' },
        { name: 'Radio Rodja 756 AM', streamUrl: 'https://radioislamindonesia.com/rodja.mp3', genre: 'religious', countryRef: '@countries:id' },
        { name: 'Sonora FM 92 Jakarta', streamUrl: 'https://sonora-radio.arenastreaming.com/8130/stream', genre: 'news', countryRef: '@countries:id' },
        { name: 'Elshinta FM Jakarta', streamUrl: 'https://stream-ssl.arenastreaming.com:8000/jakarta', genre: 'news', countryRef: '@countries:id' },
        { name: 'Campursari FM Jakarta', streamUrl: 'https://streaming.campursarifm.com/listen/campursari/campursari892', genre: 'dangdut', countryRef: '@countries:id' },
        { name: 'Mettaswara Dangdut', streamUrl: 'https://mettaswara.com:8700/d4d', genre: 'dangdut', countryRef: '@countries:id' },
        // off-air showcase: stationCatalog (where active:true) must hide this row
        { name: 'Amandit 93.9 FM', streamUrl: 'https://b.alhastream.com:5035/radio', genre: 'dangdut', countryRef: '@countries:id', active: false },
        // ---- Indonesia · Bandung ----
        { name: 'Ardan Radio 105.9 Bandung', streamUrl: 'https://stream.rcs.revma.com/ugpyzu9n5k3vv', genre: 'pop', countryRef: '@countries:id' },
        { name: 'Dahlia FM 101.5 Bandung', streamUrl: 'https://svara-stream.radioddns.net/bandung_dahliafm', genre: 'dangdut', countryRef: '@countries:id' },
        { name: 'K-Lite FM 107.1 Bandung', streamUrl: 'https://svara-stream.radioddns.net/bandung_klitefm_acc', genre: 'pop', countryRef: '@countries:id' },
        // ---- Indonesia · Surabaya ----
        { name: 'Suara Surabaya FM 100.0', streamUrl: 'https://c5.siar.us/proxy/ssfm/stream', genre: 'news', countryRef: '@countries:id' },
        { name: 'Mercury FM 96.0 Surabaya', streamUrl: 'https://svara-stream.radioddns.net/surabaya_mercuryfm-aac', genre: 'news', countryRef: '@countries:id' },
        { name: 'Suzana FM 91.3 Surabaya', streamUrl: 'https://streaming.suzanafm.com:8000/;stream.mp3', genre: 'pop', countryRef: '@countries:id' },
        { name: 'Wijaya FM 103.5 Surabaya', streamUrl: 'http://wijayafm.onlivestreaming.net:9880/stream', genre: 'dangdut', countryRef: '@countries:id' },
        { name: 'Hard Rock FM 89.7 Surabaya', streamUrl: 'https://stream.radiojar.com/yg8ne2v80k8uv', genre: 'rock', countryRef: '@countries:id' },
        // ---- Indonesia · Semarang ----
        { name: 'Radio Idola 92.6 Semarang', streamUrl: 'https://livestreaming.radioidola.com/live.mp3', genre: 'news', countryRef: '@countries:id' },
        { name: 'Rasika FM 105.6 Semarang', streamUrl: 'https://svara-stream.radioddns.net/rasikafm_stereo', genre: 'pop', countryRef: '@countries:id' },
        // ---- Indonesia · Bali ----
        { name: 'The Beat Radio Bali', streamUrl: 'https://c1.siar.us/radio/8030/stream', genre: 'electronic', countryRef: '@countries:id' },
        // ---- international ----
        { name: 'SomaFM Groove Salad', streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3', genre: 'electronic', countryRef: '@countries:us' },
        { name: 'NTS Radio London', streamUrl: 'https://stream-relay-geo.ntslive.net/stream', genre: 'electronic', countryRef: '@countries:gb' },
        { name: 'FIP Paris', streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3', genre: 'jazz', countryRef: '@countries:fr' },
        { name: 'KEXP Seattle', streamUrl: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3', genre: 'indie', countryRef: '@countries:us' },
        { name: 'WNYC New York', streamUrl: 'https://fm939.wnyc.org/wnycfm', genre: 'news', countryRef: '@countries:us' },
        { name: 'NPO Radio 1', streamUrl: 'https://icecast.omroep.nl/radio1-bb-mp3', genre: 'news', countryRef: '@countries:nl' },
      ],
    }),
  },
  views: {
    // public, curated projection for the dock: active stations + their country
    stationCatalog: defineView('stationCatalog', {
      label: 'Public station catalog',
      from: 'stations',
      select: { id: 'id', name: 'name', genre: 'genre', streamUrl: 'streamUrl', status: 'statusLabel', countryRef: 'countryRef' },
      where: { active: true },
      expand: ['countryRef'],
      order: 'name',
      limit: 100,
      menu: { group: 'Radio', icon: '📻', order: 10 },
    }),
    stationCountByGenre: defineView('stationCountByGenre', {
      label: 'Stations per genre',
      from: 'stations',
      aggregate: { groupBy: ['genre'], metrics: { stations: { fn: 'count' } } },
      order: '-stations',
      limit: 30,
      menu: { group: 'Radio', icon: '🎼', order: 20 },
    }),
    // cross-reference aggregate: which countries broadcast the most
    stationCountByCountry: defineView('stationCountByCountry', {
      label: 'Stations per country',
      from: 'stations',
      aggregate: { groupBy: ['countryRef'], metrics: { stations: { fn: 'count' } } },
      expand: ['countryRef'],
      order: '-stations',
      limit: 50,
      menu: { group: 'Radio', order: 21 },
    }),
    // the operator's to-do list: an admin page that appears in _schema.menu on
    // its own, so Headquarters needs no new code to show it
    unhealthyStations: defineView('unhealthyStations', {
      label: 'Stations the probe could not reach',
      from: 'stations',
      select: {
        id: 'id',
        name: 'name',
        streamUrl: 'streamUrl',
        status: 'statusLabel',
        probeFails: 'probeFails',
        lastCheckedAt: 'lastCheckedAt',
      },
      where: { probeOk: false },
      order: '-probeFails,name',
      limit: 50,
      acl: ['admin'],
      menu: { group: 'Radio', icon: '⚠️', order: 22 },
    }),
  },
  cron: [
    {
      /**
       * "Is this stream still up?" used to be a README instruction for a human.
       * It is now a 15-minute pass that records what it saw — never mutating the
       * catalog, only annotating it. Off unless the operator allows egress.
       */
      name: 'probe-stations',
      every: '15m',
      run: async ({ orm, env }) => {
        if (env.EGRESS_ENABLED !== 'true') return { skipped: 'EGRESS_ENABLED is not true' }
        const stations = orm.model('stations')
        const rows = await stations.list({ where: { active: true }, limit: 500 })
        let ok = 0
        let failed = 0
        for (const row of rows) {
          const alive = await probeStream(String(row.streamUrl ?? ''))
          const fails = alive ? 0 : Number(row.probeFails ?? 0) + 1
          await stations.update(String(row.id), {
            lastCheckedAt: new Date().toISOString(),
            probeOk: alive,
            probeFails: fails,
          })
          if (alive) ok++
          else failed++
        }
        return { checked: rows.length, ok, failed }
      },
    },
  ],
})
