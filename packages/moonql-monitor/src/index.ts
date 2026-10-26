import { badRequest, notFound } from '@moonwitness/core'
import {
  ADMIN_FULL,
  ADMIN_WRITE,
  bool,
  computed,
  defineAddon,
  defineModel,
  defineView,
  int,
  m2o,
  sel,
  str,
  text,
  ts,
} from '@moonwitness/moonql'

const RADAR_CATEGORIES = [
  'youtube_intel',
  'social_movement',
  'underground_scene',
  'civic_watch',
  'cyber_osint',
  'media_narrative',
] as const

const PRIORITIES = ['critical', 'high', 'normal', 'low'] as const
const PLATFORMS = ['youtube', 'x', 'instagram', 'tiktok', 'rss', 'web'] as const
const SOURCE_KINDS = ['channel', 'keyword', 'account', 'playlist', 'feed', 'page'] as const
const DRIVERS = ['rss', 'api', 'playwright', 'openclaw', 'agent'] as const
const HEALTH_STATES = ['healthy', 'degraded', 'idle'] as const
const SENTIMENTS = ['positive', 'neutral', 'critical', 'alert'] as const
const SIGNAL_STATES = ['new', 'analyzing', 'verified', 'flagged', 'promoted'] as const
const TASK_STATES = ['pending', 'running', 'done', 'error'] as const

/**
 * moonql-monitor — World Monitor 3-tier intelligence control plane:
 *   Tier 1 (`monitor_radars`): Macro Operations / Issues / Topics
 *   Tier 2 (`monitor_sources`): Channels / Accounts / Queries / Feeds (YouTube, Social Media, Web)
 *   Tier 3 (`monitor_signals`): Captured Signals / Videos / Posts + AI Intelligence
 *   Queue  (`monitor_tasks`): Pull-queue for external `apps/sentinel` workers
 *                             (Playwright, OpenClaw, YouTube RSS/API, Agentic AI)
 */
export const monitor = defineAddon({
  name: 'monitor',
  version: '1.0.0',
  depends: ['base', 'auth'],
  env: ['EGRESS_ENABLED'],
  models: {
    monitor_radars: defineModel({
      label: 'Monitor Radar',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'World Monitor', icon: '🛰️', order: 10 },
      fields: {
        code: str({ maxLength: 40 }),
        name: str({ maxLength: 120 }),
        category: sel(RADAR_CATEGORIES),
        priority: sel(PRIORITIES, { default: 'normal' }),
        countryRef: m2o('countries', { null: true, index: true }),
        description: str({ maxLength: 400, null: true }),
        active: bool({ default: true }),
        tierLabel: computed({
          type: 'string',
          deps: ['priority', 'active'],
          get: (row) => (row.active === false ? 'dormant' : String(row.priority ?? 'normal')),
        }),
      },
      unique: [['code'], ['name']],
      seed: [
        {
          code: 'yt-indonesia-civic',
          name: 'YouTube Civic & Policy Watch ID',
          category: 'youtube_intel',
          priority: 'critical',
          countryRef: '@countries:id',
          description: 'Monitors public policy debates, investigative broadcasts, and civic townhalls on YouTube Indonesia.',
          active: true,
        },
        {
          code: 'yt-underground-zine',
          name: 'Ska, Punk & Underground Broadcast',
          category: 'underground_scene',
          priority: 'high',
          countryRef: '@countries:id',
          description: 'Tracks independent ska/punk live sessions, zine releases, and underground radio sessions.',
          active: true,
        },
        {
          code: 'soc-sea-climate',
          name: 'SE Asia Climate & Ecology Pulse',
          category: 'social_movement',
          priority: 'critical',
          countryRef: '@countries:id',
          description: 'Cross-platform social monitoring of environmental alerts, floods, and ecological campaigns across SE Asia.',
          active: true,
        },
        {
          code: 'soc-tech-ai-watch',
          name: 'Agentic AI & OpenClaw Telemetry',
          category: 'cyber_osint',
          priority: 'high',
          countryRef: '@countries:us',
          description: 'Tracks autonomous agent breakthroughs, browser automation releases, and open-source AI tooling.',
          active: true,
        },
        {
          code: 'yt-independent-radio',
          name: 'Global Independent Radio Streams',
          category: 'underground_scene',
          priority: 'normal',
          countryRef: '@countries:gb',
          description: 'Monitors NTS, KEXP, SomaFM, and community radio video archives and live studio sets.',
          active: true,
        },
        {
          code: 'soc-jakarta-urban',
          name: 'Jakarta Street & Commuter Signals',
          category: 'civic_watch',
          priority: 'high',
          countryRef: '@countries:id',
          description: 'Real-time citizen reports on urban transit, commuter lines, and street-level developments in Jabodetabek.',
          active: true,
        },
        {
          code: 'yt-archival-documentary',
          name: 'Counter-Culture Documentary Vault',
          category: 'media_narrative',
          priority: 'normal',
          countryRef: '@countries:us',
          description: 'Long-form essays and archival documentaries on sound system culture, radio history, and independent press.',
          active: true,
        },
        {
          code: 'soc-creator-discourse',
          name: 'Creator Economy & Algorithm Shift',
          category: 'media_narrative',
          priority: 'normal',
          countryRef: '@countries:id',
          description: 'Monitors viral discourse shifts, platform policy changes, and independent creator syndicates.',
          active: true,
        },
        {
          code: 'cyber-scraper-defense',
          name: 'Web Extraction & Anti-Bot Radar',
          category: 'cyber_osint',
          priority: 'high',
          countryRef: '@countries:nl',
          description: 'Tracks DOM changes, headless browser fingerprints, and OpenClaw extraction health.',
          active: true,
        },
        {
          code: 'yt-nusantara-dub',
          name: 'Nusantara Dub, Reggae & Ska Collective',
          category: 'underground_scene',
          priority: 'normal',
          countryRef: '@countries:id',
          description: 'Regional gigs, vinyl dubplate sessions, and sound system dispatches across Jakarta, Bandung, and Bali.',
          active: true,
        },
      ],
    }),

    monitor_sources: defineModel({
      label: 'Monitor Source',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'World Monitor', icon: '📡', order: 20 },
      fields: {
        handle: str({ maxLength: 80 }),
        name: str({ maxLength: 140 }),
        radarRef: m2o('monitor_radars', { index: true }),
        platform: sel(PLATFORMS),
        kind: sel(SOURCE_KINDS),
        driver: sel(DRIVERS, { default: 'rss' }),
        targetUrl: str({ format: 'uri', maxLength: 500 }),
        externalTarget: str({ maxLength: 160, null: true }),
        intervalMin: int({ default: 30 }),
        active: bool({ default: true }),
        lastCheckedAt: ts({ null: true }),
        healthStatus: sel(HEALTH_STATES, { default: 'healthy' }),
        failCount: int({ default: 0 }),
      },
      unique: [['handle']],
      seed: [
        {
          handle: 'yt-narasi-newsroom',
          name: 'Narasi Newsroom YouTube Feed',
          radarRef: '@monitor_radars:yt-indonesia-civic',
          platform: 'youtube',
          kind: 'channel',
          driver: 'rss',
          targetUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbanqp8-nefH9jhX8p7rA7A',
          externalTarget: 'UCbanqp8-nefH9jhX8p7rA7A',
          intervalMin: 15,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'yt-kexp-sessions',
          name: 'KEXP Live Studio Sessions (YouTube)',
          radarRef: '@monitor_radars:yt-independent-radio',
          platform: 'youtube',
          kind: 'channel',
          driver: 'rss',
          targetUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC3I2GFN_F8WudD_2jUZbojA',
          externalTarget: 'UC3I2GFN_F8WudD_2jUZbojA',
          intervalMin: 30,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'yt-ska-feast-search',
          name: 'YouTube Ska & Punk Zine Live Search',
          radarRef: '@monitor_radars:yt-underground-zine',
          platform: 'youtube',
          kind: 'keyword',
          driver: 'playwright',
          targetUrl: 'https://www.youtube.com/results?search_query=indonesia+ska+punk+live+session',
          externalTarget: 'indonesia ska punk live session',
          intervalMin: 60,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'x-jakarta-commuter',
          name: 'X / Twitter Jabodetabek Transit Pulse',
          radarRef: '@monitor_radars:soc-jakarta-urban',
          platform: 'x',
          kind: 'keyword',
          driver: 'playwright',
          targetUrl: 'https://x.com/search?q=commuterline+jakarta&f=live',
          externalTarget: 'commuterline jakarta',
          intervalMin: 10,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'ig-underground-gigs-id',
          name: 'Instagram Underground Gigs & Zine Flyers',
          radarRef: '@monitor_radars:yt-underground-zine',
          platform: 'instagram',
          kind: 'account',
          driver: 'playwright',
          targetUrl: 'https://www.instagram.com/explore/tags/jakartagigs/',
          externalTarget: '#jakartagigs',
          intervalMin: 45,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'tt-sea-climate-watch',
          name: 'TikTok SE Asia Flood & Weather Witness',
          radarRef: '@monitor_radars:soc-sea-climate',
          platform: 'tiktok',
          kind: 'keyword',
          driver: 'openclaw',
          targetUrl: 'https://www.tiktok.com/tag/cuacajakarta',
          externalTarget: '#cuacajakarta',
          intervalMin: 20,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'web-openclaw-ai-radar',
          name: 'Autonomous Agentic AI & OpenClaw Brief',
          radarRef: '@monitor_radars:soc-tech-ai-watch',
          platform: 'web',
          kind: 'page',
          driver: 'agent',
          targetUrl: 'https://news.ycombinator.com/newest',
          externalTarget: 'agentic playwright openclaw',
          intervalMin: 30,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'yt-nts-live-archive',
          name: 'NTS Radio YouTube Broadcasts',
          radarRef: '@monitor_radars:yt-independent-radio',
          platform: 'youtube',
          kind: 'channel',
          driver: 'rss',
          targetUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCcd933v9T-cUfS_B8jbf-3Q',
          externalTarget: 'UCcd933v9T-cUfS_B8jbf-3Q',
          intervalMin: 60,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'yt-docu-sound-system',
          name: 'Sound System & Dub History Archive',
          radarRef: '@monitor_radars:yt-archival-documentary',
          platform: 'youtube',
          kind: 'playlist',
          driver: 'api',
          targetUrl: 'https://www.youtube.com/results?search_query=jamaican+sound+system+documentary',
          externalTarget: 'jamaican sound system documentary',
          intervalMin: 120,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'web-creator-algo-watch',
          name: 'Social Platform Algorithm Shift Crawler',
          radarRef: '@monitor_radars:soc-creator-discourse',
          platform: 'web',
          kind: 'feed',
          driver: 'openclaw',
          targetUrl: 'https://www.theverge.com/rss/creators/index.xml',
          externalTarget: 'creator-rss',
          intervalMin: 45,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'web-antibot-telemetry',
          name: 'Headless Browser & Scraper Defense Watch',
          radarRef: '@monitor_radars:cyber-scraper-defense',
          platform: 'rss',
          kind: 'feed',
          driver: 'openclaw',
          targetUrl: 'https://hnrss.org/newest?q=playwright+scraping',
          externalTarget: 'playwright scraping',
          intervalMin: 60,
          active: true,
          healthStatus: 'healthy',
        },
        {
          handle: 'yt-nusantara-dub-sessions',
          name: 'Nusantara Dub & Ska Vinyl Sessions',
          radarRef: '@monitor_radars:yt-nusantara-dub',
          platform: 'youtube',
          kind: 'keyword',
          driver: 'agent',
          targetUrl: 'https://www.youtube.com/results?search_query=dub+reggae+indonesia+vinyl',
          externalTarget: 'dub reggae indonesia vinyl',
          intervalMin: 90,
          active: true,
          healthStatus: 'healthy',
        },
      ],
    }),

    monitor_signals: defineModel({
      label: 'Monitor Signal',
      rest: true,
      acl: ADMIN_WRITE,
      menu: { group: 'World Monitor', icon: '⚡', order: 30 },
      fields: {
        externalId: str({ maxLength: 160, index: true }),
        title: str({ maxLength: 240 }),
        url: str({ format: 'uri', maxLength: 500 }),
        sourceRef: m2o('monitor_sources', { index: true }),
        radarRef: m2o('monitor_radars', { index: true }),
        platform: sel(PLATFORMS),
        author: str({ maxLength: 120, null: true }),
        summary: text({ null: true }),
        aiSummary: text({ null: true }),
        sentiment: sel(SENTIMENTS, { default: 'neutral' }),
        urgencyScore: int({ default: 50 }),
        viewsCount: int({ default: 0 }),
        likesCount: int({ default: 0 }),
        commentsCount: int({ default: 0 }),
        status: sel(SIGNAL_STATES, { default: 'new', index: true }),
        publishedAt: ts({ null: true }),
      },
      unique: [['sourceRef', 'externalId']],
      seed: [
        {
          externalId: 'yt:narasi:civic-townhall-01',
          title: 'Investigasi Kebijakan Ruang Publik & Transparansi Data Kota',
          url: 'https://www.youtube.com/watch?v=civicTownhall01',
          sourceRef: '@monitor_sources:yt-narasi-newsroom',
          radarRef: '@monitor_radars:yt-indonesia-civic',
          platform: 'youtube',
          author: 'Narasi Newsroom',
          summary: 'Diskusi mendalam mengenai tata kelola transportasi publik dan keterbukaan data anggaran daerah.',
          aiSummary: 'High civic engagement (+42% comment velocity). Key theme: open municipal data and transit integration.',
          sentiment: 'critical',
          urgencyScore: 88,
          viewsCount: 184200,
          likesCount: 9400,
          commentsCount: 1620,
          status: 'verified',
          publishedAt: '2026-10-25T14:30:00.000Z',
        },
        {
          externalId: 'yt:ska:feast-of-trumpets-live',
          title: 'The Real Feast of Trumpets — Full Ska-Core Basement Session (Jakarta)',
          url: 'https://www.youtube.com/watch?v=skaFeastLive02',
          sourceRef: '@monitor_sources:yt-ska-feast-search',
          radarRef: '@monitor_radars:yt-underground-zine',
          platform: 'youtube',
          author: 'Moonwitness Zine TV',
          summary: 'Rekaman live 4-track brass section dan punk-zine kolektif di Kemang Timur.',
          aiSummary: 'Strong underground traction. Cross-referenced with 14 radio requests on Denpa Hub.',
          sentiment: 'positive',
          urgencyScore: 76,
          viewsCount: 31500,
          likesCount: 4120,
          commentsCount: 380,
          status: 'promoted',
          publishedAt: '2026-10-25T19:00:00.000Z',
        },
        {
          externalId: 'tt:climate:manggarai-water-gate',
          title: 'Pantauan Tinggi Muka Air Pintu Air Manggarai Pasca Hujan Deras Hulu',
          url: 'https://www.tiktok.com/@witness.id/video/7401928371',
          sourceRef: '@monitor_sources:tt-sea-climate-watch',
          radarRef: '@monitor_radars:soc-sea-climate',
          platform: 'tiktok',
          author: '@witness.id',
          summary: 'Laporan visual warga terkait kenaikan debit air Sungai Ciliwung malam ini.',
          aiSummary: 'Urgent field telemetry verified across 3 citizen videos. Recommended for on-air weather bulletin.',
          sentiment: 'alert',
          urgencyScore: 94,
          viewsCount: 412000,
          likesCount: 28900,
          commentsCount: 2150,
          status: 'flagged',
          publishedAt: '2026-10-25T21:15:00.000Z',
        },
        {
          externalId: 'x:transit:krl-manggarai-signal',
          title: 'Update Kepadatan Peron Transit Manggarai Jam Pulang Kerja',
          url: 'https://x.com/commuterwatch/status/18499102938',
          sourceRef: '@monitor_sources:x-jakarta-commuter',
          radarRef: '@monitor_radars:soc-jakarta-urban',
          platform: 'x',
          author: '@commuterwatch',
          summary: 'Arus penumpang menuju Bogor dan Bekasi terpantau padat merayap namun jalur sinyal normal.',
          aiSummary: 'Routine peak-hour congestion; sentiment stabilizing after 19:30 WIB.',
          sentiment: 'neutral',
          urgencyScore: 64,
          viewsCount: 54000,
          likesCount: 830,
          commentsCount: 195,
          status: 'verified',
          publishedAt: '2026-10-25T12:40:00.000Z',
        },
        {
          externalId: 'yt:kexp:midnight-dub-session',
          title: 'Heavyweight Analog Dub & Brass Collective — Live on KEXP',
          url: 'https://www.youtube.com/watch?v=kexpAnalogDub05',
          sourceRef: '@monitor_sources:yt-kexp-sessions',
          radarRef: '@monitor_radars:yt-independent-radio',
          platform: 'youtube',
          author: 'KEXP',
          summary: 'Full 32-minute live performance mixed on vintage spring reverb and tape delay.',
          aiSummary: 'High audio fidelity match for midnight broadcast rotation.',
          sentiment: 'positive',
          urgencyScore: 58,
          viewsCount: 92400,
          likesCount: 6800,
          commentsCount: 410,
          status: 'promoted',
          publishedAt: '2026-10-24T22:00:00.000Z',
        },
        {
          externalId: 'web:ai:openclaw-dom-extractor',
          title: 'OpenClaw v2 + Playwright: Deterministic DOM Graphs for Agentic Scrapers',
          url: 'https://news.ycombinator.com/item?id=41990123',
          sourceRef: '@monitor_sources:web-openclaw-ai-radar',
          radarRef: '@monitor_radars:soc-tech-ai-watch',
          platform: 'web',
          author: 'hn_systems',
          summary: 'Benchmarks on combining headless Chromium accessibility trees with compact LLM extraction.',
          aiSummary: 'Directly applicable to Sentinel worker OpenClaw adapter pipeline.',
          sentiment: 'positive',
          urgencyScore: 81,
          viewsCount: 19800,
          likesCount: 640,
          commentsCount: 230,
          status: 'verified',
          publishedAt: '2026-10-25T08:10:00.000Z',
        },
        {
          externalId: 'ig:gigs:kemang-zine-fest',
          title: 'Flyer Rilis: Pasar Zine Independen & Kaset Bawah Tanah Akhir Pekan',
          url: 'https://www.instagram.com/p/DB99102A/',
          sourceRef: '@monitor_sources:ig-underground-gigs-id',
          radarRef: '@monitor_radars:yt-underground-zine',
          platform: 'instagram',
          author: '@jakartazinepress',
          summary: '40+ kolektif zine, lapak piringan hitam, dan diskusi radio komunitas.',
          aiSummary: 'Community event detected in South Jakarta; 6 participating bands are in station catalog.',
          sentiment: 'positive',
          urgencyScore: 72,
          viewsCount: 14200,
          likesCount: 2310,
          commentsCount: 145,
          status: 'new',
          publishedAt: '2026-10-25T10:00:00.000Z',
        },
        {
          externalId: 'yt:nts:london-night-bus',
          title: 'NTS Night Bus: Post-Punk, 2-Tone Ska & Industrial Dubplates',
          url: 'https://www.youtube.com/watch?v=ntsNightBus08',
          sourceRef: '@monitor_sources:yt-nts-live-archive',
          radarRef: '@monitor_radars:yt-independent-radio',
          platform: 'youtube',
          author: 'NTS Radio',
          summary: 'Two-hour archival broadcast from Hackney booth featuring rare 1979 Coventry 2-Tone pressings.',
          aiSummary: 'Tracklist extracted (28 tracks); 92% match with Moonwitness aesthetic profile.',
          sentiment: 'positive',
          urgencyScore: 60,
          viewsCount: 41000,
          likesCount: 3200,
          commentsCount: 180,
          status: 'verified',
          publishedAt: '2026-10-24T18:00:00.000Z',
        },
        {
          externalId: 'yt:docu:channel-one-roots',
          title: 'Bass Culture: How DIY Sound Systems Rewired Urban Radio',
          url: 'https://www.youtube.com/watch?v=bassCultureDoc09',
          sourceRef: '@monitor_sources:yt-docu-sound-system',
          radarRef: '@monitor_radars:yt-archival-documentary',
          platform: 'youtube',
          author: 'Subculture Archive',
          summary: 'Mini-documentary on custom horn enclosures, pirate transmitters, and street journalism.',
          aiSummary: 'Archival reference cataloged for studio editorial notes.',
          sentiment: 'neutral',
          urgencyScore: 48,
          viewsCount: 67500,
          likesCount: 5100,
          commentsCount: 290,
          status: 'new',
          publishedAt: '2026-10-23T15:20:00.000Z',
        },
        {
          externalId: 'web:creator:rss-resurgence',
          title: 'Why Independent Broadcasters Are Moving Back to Open Feeds & Federated Hubs',
          url: 'https://www.theverge.com/2026/10/25/open-rss-broadcasters',
          sourceRef: '@monitor_sources:web-creator-algo-watch',
          radarRef: '@monitor_radars:soc-creator-discourse',
          platform: 'web',
          author: 'Media Desk',
          summary: 'Analysis of algorithmic volatility on short-video platforms driving syndication back to owned hubs.',
          aiSummary: 'Trend validation: open RSS + YouTube Atom feeds remain the highest-signal zero-key channels.',
          sentiment: 'neutral',
          urgencyScore: 55,
          viewsCount: 28400,
          likesCount: 910,
          commentsCount: 134,
          status: 'verified',
          publishedAt: '2026-10-25T06:45:00.000Z',
        },
        {
          externalId: 'rss:antibot:stealth-cdp-2026',
          title: 'Mitigating CDP Detection in Long-Running Playwright Worker Pools',
          url: 'https://example.org/osint/playwright-worker-pools',
          sourceRef: '@monitor_sources:web-antibot-telemetry',
          radarRef: '@monitor_radars:cyber-scraper-defense',
          platform: 'rss',
          author: 'SecOps Lab',
          summary: 'Techniques for isolated browser contexts, session rotation, and polite rate-limiting.',
          aiSummary: 'Operational note for apps/sentinel Playwright driver configuration.',
          sentiment: 'critical',
          urgencyScore: 79,
          viewsCount: 11300,
          likesCount: 420,
          commentsCount: 88,
          status: 'analyzing',
          publishedAt: '2026-10-25T11:30:00.000Z',
        },
        {
          externalId: 'yt:dub:bandung-analog-dubplate',
          title: 'Bandung Dub Syndicate — Live Tape Echo & Melodica Session',
          url: 'https://www.youtube.com/watch?v=bdgDubSyndicate12',
          sourceRef: '@monitor_sources:yt-nusantara-dub-sessions',
          radarRef: '@monitor_radars:yt-nusantara-dub',
          platform: 'youtube',
          author: 'Priangan Sound',
          summary: 'Sesi dub analog langsung dari studio bawah tanah Dago dengan 100% instrumen organik.',
          aiSummary: 'Rising regional velocity in West Java; queued for weekend dub slot.',
          sentiment: 'positive',
          urgencyScore: 69,
          viewsCount: 22900,
          likesCount: 2750,
          commentsCount: 215,
          status: 'promoted',
          publishedAt: '2026-10-25T16:10:00.000Z',
        },
      ],
    }),

    monitor_tasks: defineModel({
      label: 'Monitor Task',
      seedless: true,
      rest: true,
      acl: ADMIN_FULL,
      menu: { group: 'World Monitor', icon: '🤖', order: 40 },
      fields: {
        sourceRef: m2o('monitor_sources', { index: true }),
        radarRef: m2o('monitor_radars', { null: true, index: true }),
        driver: sel(DRIVERS),
        status: sel(TASK_STATES, { default: 'pending', index: true }),
        workerId: str({ maxLength: 80, null: true }),
        signalsCaptured: int({ default: 0 }),
        detail: str({ maxLength: 400, null: true }),
      },
    }),
  },

  views: {
    monitorHierarchy: defineView('monitorHierarchy', {
      label: 'Active monitor radars (Tier 1)',
      from: 'monitor_radars',
      select: {
        id: 'id',
        code: 'code',
        name: 'name',
        category: 'category',
        priority: 'priority',
        tier: 'tierLabel',
        description: 'description',
        countryRef: 'countryRef',
      },
      where: { active: true },
      expand: ['countryRef'],
      order: 'name',
      limit: 100,
      menu: { group: 'World Monitor', icon: '🧭', order: 1 },
    }),

    monitorActiveSources: defineView('monitorActiveSources', {
      label: 'Active monitor sources (Tier 2)',
      from: 'monitor_sources',
      select: {
        id: 'id',
        handle: 'handle',
        name: 'name',
        radarRef: 'radarRef',
        platform: 'platform',
        kind: 'kind',
        driver: 'driver',
        targetUrl: 'targetUrl',
        externalTarget: 'externalTarget',
        intervalMin: 'intervalMin',
        healthStatus: 'healthStatus',
        lastCheckedAt: 'lastCheckedAt',
      },
      where: { active: true },
      expand: ['radarRef'],
      order: 'name',
      limit: 200,
      menu: { group: 'World Monitor', icon: '📡', order: 2 },
    }),

    monitorSignalFeed: defineView('monitorSignalFeed', {
      label: 'Captured intelligence signals (Tier 3)',
      from: 'monitor_signals',
      select: {
        id: 'id',
        externalId: 'externalId',
        title: 'title',
        url: 'url',
        platform: 'platform',
        author: 'author',
        summary: 'summary',
        aiSummary: 'aiSummary',
        sentiment: 'sentiment',
        urgencyScore: 'urgencyScore',
        viewsCount: 'viewsCount',
        likesCount: 'likesCount',
        commentsCount: 'commentsCount',
        status: 'status',
        publishedAt: 'publishedAt',
        sourceRef: 'sourceRef',
        radarRef: 'radarRef',
      },
      expand: ['sourceRef', 'radarRef'],
      order: '-urgencyScore,-publishedAt',
      limit: 100,
      menu: { group: 'World Monitor', icon: '⚡', order: 3 },
    }),

    monitorSignalsByPlatform: defineView('monitorSignalsByPlatform', {
      label: 'Signals per platform',
      from: 'monitor_signals',
      aggregate: { groupBy: ['platform'], metrics: { signals: { fn: 'count' } } },
      order: '-signals',
      limit: 20,
      menu: { group: 'World Monitor', icon: '📊', order: 15 },
    }),

    monitorSignalsByRadar: defineView('monitorSignalsByRadar', {
      label: 'Signals per radar',
      from: 'monitor_signals',
      aggregate: { groupBy: ['radarRef'], metrics: { signals: { fn: 'count' } } },
      expand: ['radarRef'],
      order: '-signals',
      limit: 50,
      menu: { group: 'World Monitor', icon: '🎯', order: 16 },
    }),
  },

  endpoints: {
    overview: {
      path: '/monitor/overview',
      method: 'GET',
      menu: { group: 'World Monitor', icon: '🌐', order: 5 },
      handler: async ({ orm }) => {
        const [radarsPage, sourcesPage, signalsPage, tasksPage] = await Promise.all([
          orm.model('monitor_radars').search({ limit: 100, order: 'name' }),
          orm.model('monitor_sources').search({ limit: 250, order: 'name' }),
          orm.model('monitor_signals').search({ limit: 100, order: '-urgencyScore,-createdAt' }),
          orm.model('monitor_tasks').search({ limit: 30, order: '-createdAt' }),
        ])

        const radars = radarsPage.rows as Array<Record<string, unknown>>
        const sources = sourcesPage.rows as Array<Record<string, unknown>>
        const signals = signalsPage.rows as Array<Record<string, unknown>>
        const tasks = tasksPage.rows as Array<Record<string, unknown>>

        const sourceCountByRadar = new Map<string, number>()
        for (const s of sources) {
          const rId = String(s.radarRef ?? '')
          sourceCountByRadar.set(rId, (sourceCountByRadar.get(rId) ?? 0) + 1)
        }

        const signalCountByRadar = new Map<string, number>()
        const signalCountBySource = new Map<string, number>()
        let criticalSignals = 0
        for (const sig of signals) {
          const rId = String(sig.radarRef ?? '')
          const sId = String(sig.sourceRef ?? '')
          signalCountByRadar.set(rId, (signalCountByRadar.get(rId) ?? 0) + 1)
          signalCountBySource.set(sId, (signalCountBySource.get(sId) ?? 0) + 1)
          if (sig.sentiment === 'critical' || sig.sentiment === 'alert' || Number(sig.urgencyScore ?? 0) >= 80) {
            criticalSignals++
          }
        }

        return {
          counts: {
            radars: radars.length,
            activeRadars: radars.filter((r) => r.active !== false).length,
            sources: sources.length,
            activeSources: sources.filter((s) => s.active !== false).length,
            signals: signals.length,
            criticalSignals,
            pendingTasks: tasks.filter((t) => t.status === 'pending' || t.status === 'running').length,
          },
          radars: radars.map((r) => ({
            ...r,
            sourceCount: sourceCountByRadar.get(String(r.id)) ?? 0,
            signalCount: signalCountByRadar.get(String(r.id)) ?? 0,
          })),
          sources: sources.map((s) => ({
            ...s,
            signalCount: signalCountBySource.get(String(s.id)) ?? 0,
          })),
          signals: signals.slice(0, 40),
          tasks: tasks.slice(0, 15),
        }
      },
    },

    enqueue: {
      path: '/monitor/enqueue',
      method: 'POST',
      requires: ['admin', 'bot'],
      body: {
        sourceRef: str({ maxLength: 60, null: true }),
        driver: sel(DRIVERS, { null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const sourcesRepo = orm.model('monitor_sources')
        const tasksRepo = orm.model('monitor_tasks')

        const where: Record<string, unknown> = { active: true }
        if (body.sourceRef) where.id = String(body.sourceRef)
        if (body.driver) where.driver = String(body.driver)

        const sources = (await sourcesRepo.list({ where, limit: 100 })) as Array<Record<string, unknown>>
        const openTasks = (await tasksRepo.list({ where: { status: 'pending' }, limit: 200 })) as Array<Record<string, unknown>>
        const busySources = new Set(openTasks.map((t) => String(t.sourceRef)))

        const created: Array<Record<string, unknown>> = []
        for (const src of sources) {
          const srcId = String(src.id)
          if (busySources.has(srcId)) continue
          const task = (await tasksRepo.create({
            sourceRef: srcId,
            radarRef: src.radarRef ? String(src.radarRef) : null,
            driver: String(src.driver ?? 'rss'),
            status: 'pending',
            detail: `Queued ${String(src.platform)}:${String(src.handle)}`,
          })) as Record<string, unknown>
          created.push(task)
        }
        status(201)
        return { queued: created.length, tasks: created }
      },
    },

    claim: {
      path: '/monitor/claim',
      method: 'POST',
      requires: ['admin', 'bot'],
      body: {
        workerId: str({ maxLength: 80 }),
        drivers: str({ maxLength: 160, null: true }),
      },
      handler: async ({ body, orm }) => {
        const workerId = String(body.workerId ?? '').trim()
        if (!workerId) throw badRequest('workerId is required')

        const allowedDrivers = new Set(
          String(body.drivers ?? 'rss,api,playwright,openclaw,agent')
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean),
        )

        const tasksRepo = orm.model('monitor_tasks')
        const sourcesRepo = orm.model('monitor_sources')
        const radarsRepo = orm.model('monitor_radars')

        const pendingPage = await tasksRepo.search({ where: { status: 'pending' }, order: 'createdAt', limit: 50 })
        let candidate = (pendingPage.rows as Array<Record<string, unknown>>).find((t) =>
          allowedDrivers.has(String(t.driver)),
        )

        if (!candidate) {
          const activeSources = (await sourcesRepo.list({ where: { active: true }, limit: 100 })) as Array<
            Record<string, unknown>
          >
          const matchingSources = activeSources.filter((s) => allowedDrivers.has(String(s.driver ?? 'rss')))
          if (matchingSources.length > 0) {
            matchingSources.sort((a, b) => {
              const ta = a.lastCheckedAt ? Date.parse(String(a.lastCheckedAt)) : 0
              const tb = b.lastCheckedAt ? Date.parse(String(b.lastCheckedAt)) : 0
              return ta - tb
            })
            const chosen = matchingSources[0]
            if (chosen) {
              candidate = (await tasksRepo.create({
                sourceRef: String(chosen.id),
                radarRef: chosen.radarRef ? String(chosen.radarRef) : null,
                driver: String(chosen.driver ?? 'rss'),
                status: 'pending',
                detail: `Auto-scheduled ${String(chosen.handle)}`,
              })) as Record<string, unknown>
            }
          }
        }

        if (!candidate) {
          return { claimed: false, task: null, source: null, radar: null }
        }

        const updatedTask = (await tasksRepo.update(String(candidate.id), {
          status: 'running',
          workerId,
        })) as Record<string, unknown>

        const source = (await sourcesRepo.get(String(candidate.sourceRef))) as Record<string, unknown>
        const radar = source.radarRef
          ? ((await radarsRepo.get(String(source.radarRef))) as Record<string, unknown>)
          : null

        return {
          claimed: true,
          task: updatedTask,
          source,
          radar,
        }
      },
    },

    ingest: {
      path: '/monitor/ingest',
      method: 'POST',
      requires: ['admin', 'bot'],
      body: {
        sourceRef: str({ maxLength: 60 }),
        taskId: str({ maxLength: 60, null: true }),
        externalId: str({ maxLength: 160 }),
        title: str({ maxLength: 240 }),
        url: str({ format: 'uri', maxLength: 500 }),
        author: str({ maxLength: 120, null: true }),
        summary: text({ null: true }),
        aiSummary: text({ null: true }),
        sentiment: sel(SENTIMENTS, { null: true }),
        urgencyScore: int({ null: true }),
        viewsCount: int({ null: true }),
        likesCount: int({ null: true }),
        commentsCount: int({ null: true }),
        publishedAt: ts({ null: true }),
      },
      handler: async ({ body, orm, status }) => {
        const sourceId = String(body.sourceRef ?? '').trim()
        const externalId = String(body.externalId ?? '').trim()
        if (!sourceId || !externalId) throw badRequest('sourceRef and externalId are required')

        const sourcesRepo = orm.model('monitor_sources')
        const signalsRepo = orm.model('monitor_signals')
        const tasksRepo = orm.model('monitor_tasks')

        const source = (await sourcesRepo.get(sourceId).catch(() => null)) as Record<string, unknown> | null
        if (!source) throw notFound(`monitor_sources "${sourceId}" not found`)

        const existingPage = await signalsRepo.search({
          where: { sourceRef: sourceId, externalId },
          limit: 1,
        })
        const existing = (existingPage.rows as Array<Record<string, unknown>>)[0]

        let signal: Record<string, unknown>
        let deduplicated = false

        if (existing) {
          deduplicated = true
          signal = (await signalsRepo.update(String(existing.id), {
            title: String(body.title),
            url: String(body.url),
            ...(body.summary !== undefined ? { summary: body.summary } : {}),
            ...(body.aiSummary !== undefined ? { aiSummary: body.aiSummary } : {}),
            ...(body.sentiment ? { sentiment: body.sentiment } : {}),
            ...(typeof body.urgencyScore === 'number' ? { urgencyScore: body.urgencyScore } : {}),
            ...(typeof body.viewsCount === 'number' ? { viewsCount: body.viewsCount } : {}),
            ...(typeof body.likesCount === 'number' ? { likesCount: body.likesCount } : {}),
            ...(typeof body.commentsCount === 'number' ? { commentsCount: body.commentsCount } : {}),
          })) as Record<string, unknown>
        } else {
          status(201)
          signal = (await signalsRepo.create({
            externalId,
            title: String(body.title),
            url: String(body.url),
            sourceRef: sourceId,
            radarRef: String(source.radarRef),
            platform: String(source.platform ?? 'web'),
            author: body.author ? String(body.author) : null,
            summary: body.summary ? String(body.summary) : null,
            aiSummary: body.aiSummary ? String(body.aiSummary) : null,
            sentiment: body.sentiment ? String(body.sentiment) : 'neutral',
            urgencyScore: typeof body.urgencyScore === 'number' ? body.urgencyScore : 55,
            viewsCount: typeof body.viewsCount === 'number' ? body.viewsCount : 0,
            likesCount: typeof body.likesCount === 'number' ? body.likesCount : 0,
            commentsCount: typeof body.commentsCount === 'number' ? body.commentsCount : 0,
            status: 'new',
            publishedAt: body.publishedAt ? String(body.publishedAt) : new Date().toISOString(),
          })) as Record<string, unknown>
        }

        await sourcesRepo.update(sourceId, {
          lastCheckedAt: new Date().toISOString(),
          healthStatus: 'healthy',
          failCount: 0,
        })

        if (body.taskId) {
          const task = (await tasksRepo.get(String(body.taskId)).catch(() => null)) as Record<string, unknown> | null
          if (task) {
            await tasksRepo.update(String(task.id), {
              status: 'done',
              signalsCaptured: Number(task.signalsCaptured ?? 0) + (deduplicated ? 0 : 1),
              detail: `Ingested ${externalId} (${deduplicated ? 'updated' : 'created'})`,
            })
          }
        }

        return { deduplicated, signal }
      },
    },
  },

  cron: [
    {
      name: 'schedule-sources',
      every: '10m',
      run: async ({ orm, env }) => {
        if (env.EGRESS_ENABLED !== 'true') {
          return { skipped: 'EGRESS_ENABLED is not true' }
        }
        const sources = (await orm.model('monitor_sources').list({ where: { active: true }, limit: 200 })) as Array<
          Record<string, unknown>
        >
        const pending = (await orm.model('monitor_tasks').list({ where: { status: 'pending' }, limit: 200 })) as Array<
          Record<string, unknown>
        >
        const queuedSet = new Set(pending.map((p) => String(p.sourceRef)))
        let enqueued = 0
        const now = Date.now()

        for (const src of sources) {
          const id = String(src.id)
          if (queuedSet.has(id)) continue
          const intervalMs = Math.max(5, Number(src.intervalMin ?? 30)) * 60_000
          const last = src.lastCheckedAt ? Date.parse(String(src.lastCheckedAt)) : 0
          if (now - last >= intervalMs) {
            await orm.model('monitor_tasks').create({
              sourceRef: id,
              radarRef: src.radarRef ? String(src.radarRef) : null,
              driver: String(src.driver ?? 'rss'),
              status: 'pending',
              detail: `Scheduled by cron (${String(src.handle)})`,
            })
            enqueued++
          }
        }
        return { activeSources: sources.length, enqueued }
      },
    },
  ],
})

export default monitor
