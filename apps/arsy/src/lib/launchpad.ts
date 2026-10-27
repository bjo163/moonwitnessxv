// The advertised origins come from the shared contract: the launchpad is the page
// that tells an operator where things live, so it must not be a second place that
// gets to decide the ports.
import { AI_GATEWAY_PUBLIC_URL, defineLocaleCatalog, FRONTEND_URLS, PORTS, type Locale } from '@moonwitness/core'

export interface LaunchpadData {
  name: string
  version: string
  engine: string
  api: string
  docs: string
  openapi: string
  health: string
  metrics: string
  studio: string
  frontends?: { dock?: string; headquarters?: string }
}

// The interpolated values come from config/env (API_TITLE etc.); this page renders
// for any browser visitor of `/`, so a title containing markup must not inject it.
const esc = (value: string): string =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  )

const launchpadCopy = defineLocaleCatalog({
  en: {
    missionControl: 'Mission Control', subtitle: 'Central development portal and service navigator for broadcast, intelligence, and AI systems.',
    active: 'MONOREPO ACTIVE', frontends: 'Frontends & Public Surfaces', publicBroadcast: 'Public Broadcast',
    dockTitle: 'Public Radio Dock', dockDesc: 'Live audio stream, now-playing card, weekly schedule, and World Monitor live ticker.',
    administration: 'Administration', hqTitle: 'Headquarters (HQ)', hqDesc: 'Mission control dashboard, database model inspection, CRUD station management, and ops view.',
    osint: 'OSINT & Surveillance', worldTitle: 'World Monitor 3-Tier', worldDesc: 'Drilldown across radars, sources, and captured signals with AI triage.',
    engines: 'Engines, APIs & Documentation', developer: 'Developer Contract', openApiTitle: 'OpenAPI Swagger Docs',
    openApiDesc: 'Interactive API surface for testing generated endpoints, models, and schemas.',
    router: 'Free-First Router', aiTitle: 'AI Gateway Router', aiDesc: 'OpenAI-compatible chat completions with Gemini, Groq, OpenRouter, Ollama, and heuristic fallback.',
    telemetry: 'Telemetry', healthTitle: 'Health & Metrics', healthDesc: 'Service health, memory use, Prometheus metrics, and ORM bus metrics.',
  },
  id: {
    missionControl: 'Pusat Kendali', subtitle: 'Portal pengembangan pusat dan penjelajah layanan untuk sistem siaran, intelijen, dan AI.',
    active: 'MONOREPO AKTIF', frontends: 'Antarmuka & Layanan Publik', publicBroadcast: 'Siaran Publik',
    dockTitle: 'Dock Radio Publik', dockDesc: 'Aliran audio langsung, kartu siaran saat ini, jadwal mingguan, dan ticker langsung World Monitor.',
    administration: 'Administrasi', hqTitle: 'Headquarters (HQ)', hqDesc: 'Dasbor kendali, pemeriksaan model basis data, pengelolaan stasiun, dan tampilan operasi.',
    osint: 'OSINT & Pemantauan', worldTitle: 'World Monitor 3-Tier', worldDesc: 'Penelusuran radar, sumber, dan sinyal yang direkam dengan triase AI.',
    engines: 'Mesin, API & Dokumentasi', developer: 'Kontrak Pengembang', openApiTitle: 'Dokumentasi Swagger OpenAPI',
    openApiDesc: 'Antarmuka interaktif untuk menguji endpoint, model, dan skema API.',
    router: 'Router Prioritas Gratis', aiTitle: 'Router AI Gateway', aiDesc: 'Chat completion yang kompatibel dengan OpenAI, menggunakan Gemini, Groq, OpenRouter, Ollama, dan fallback heuristik.',
    telemetry: 'Telemetri', healthTitle: 'Kesehatan & Metrik', healthDesc: 'Kesehatan layanan, penggunaan memori, metrik Prometheus, dan metrik bus ORM.',
  },
})

export function renderLaunchpadHtml(data: LaunchpadData, locale: Locale = 'en'): string {
  const dockUrl = data.frontends?.dock ?? FRONTEND_URLS.dock
  const hqUrl = data.frontends?.headquarters ?? FRONTEND_URLS.headquarters
  const aiUrl = AI_GATEWAY_PUBLIC_URL
  const copy = launchpadCopy[locale]

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(data.name)} · Dev Mission Control</title>
  <style>
    :root {
      --bg: #07060b;
      --card-bg: #13101d;
      --card-hover: #1b172a;
      --border: #252038;
      --border-glow: #00d4ff;
      --text: #f7f4ec;
      --muted: #8e879f;
      --cyan: #00d4ff;
      --pink: #ff007a;
      --purple: #7c3aed;
      --green: #00e676;
      --yellow: #ffd400;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      --font-sans: "Space Grotesk", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .container {
      width: 100%;
      max-width: 960px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-badge {
      background: linear-gradient(135deg, var(--pink), var(--purple));
      color: #fff;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: var(--muted);
      font-size: 15px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 20px;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }
    .card:hover {
      background-color: var(--card-hover);
      border-color: var(--border-glow);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .card-tag {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .tag-cyan { color: var(--cyan); }
    .tag-pink { color: var(--pink); }
    .tag-purple { color: var(--purple); }
    .tag-green { color: var(--green); }
    .tag-yellow { color: var(--yellow); }

    .card-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-desc {
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 16px;
      flex-grow: 1;
    }
    .card-url {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--cyan);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title {
      font-size: 13px;
      font-family: var(--font-mono);
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--muted);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border);
    }
    .status-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding: 16px 20px;
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--muted);
      align-items: center;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--green);
      display: inline-block;
      box-shadow: 0 0 8px var(--green);
    }
    .links-bar {
      display: flex;
      gap: 16px;
      font-family: var(--font-mono);
      font-size: 12px;
    }
    .links-bar a {
      color: var(--muted);
      text-decoration: none;
    }
    .links-bar a:hover {
      color: var(--cyan);
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="brand">
        <span class="brand-badge">DEV HUB</span>
        <span class="dot"></span>
        <span style="font-family: var(--font-mono); font-size: 12px; color: var(--green);">${copy.active}</span>
      </div>
      <h1>${esc(data.name)} ${copy.missionControl}</h1>
      <p class="subtitle">${copy.subtitle}</p>
    </header>

    <div class="status-bar">
      <div class="status-item"><span class="dot"></span> Radio Core: <strong>:${String(PORTS.hub)}</strong></div>
      <div class="status-item"><span class="dot"></span> Dock: <strong>:${String(PORTS.dock)}</strong></div>
      <div class="status-item"><span class="dot"></span> Headquarters: <strong>:${String(PORTS.headquarters)}</strong></div>
      <div class="status-item"><span class="dot"></span> AI Gateway: <strong>:${String(PORTS.aigateway)}</strong></div>
      <div class="status-item" style="margin-left: auto;">Engine: <strong>${esc(data.engine)}</strong></div>
    </div>

    <div>
      <div class="section-title">${copy.frontends}</div>
      <div class="grid">
        <a class="card" href="${dockUrl}" target="_blank">
          <div>
            <span class="card-tag tag-pink">${copy.publicBroadcast}</span>
            <div class="card-title">${copy.dockTitle}</div>
            <div class="card-desc">${copy.dockDesc}</div>
          </div>
          <div class="card-url">${dockUrl} &rarr;</div>
        </a>

        <a class="card" href="${hqUrl}" target="_blank">
          <div>
            <span class="card-tag tag-purple">${copy.administration}</span>
            <div class="card-title">${copy.hqTitle}</div>
            <div class="card-desc">${copy.hqDesc}</div>
          </div>
          <div class="card-url">${hqUrl} &rarr;</div>
        </a>

        <a class="card" href="${hqUrl}/world-monitor" target="_blank">
          <div>
            <span class="card-tag tag-yellow">${copy.osint}</span>
            <div class="card-title">${copy.worldTitle}</div>
            <div class="card-desc">${copy.worldDesc}</div>
          </div>
          <div class="card-url">${hqUrl}/world-monitor &rarr;</div>
        </a>
      </div>
    </div>

    <div>
      <div class="section-title">${copy.engines}</div>
      <div class="grid">
        <a class="card" href="/docs" target="_blank">
          <div>
            <span class="card-tag tag-cyan">${copy.developer}</span>
            <div class="card-title">${copy.openApiTitle}</div>
            <div class="card-desc">${copy.openApiDesc}</div>
          </div>
          <div class="card-url">/docs &rarr;</div>
        </a>

        <a class="card" href="${aiUrl}/v1/models" target="_blank">
          <div>
            <span class="card-tag tag-yellow">${copy.router}</span>
            <div class="card-title">${copy.aiTitle}</div>
            <div class="card-desc">${copy.aiDesc}</div>
          </div>
          <div class="card-url">${aiUrl}/v1/models &rarr;</div>
        </a>

        <a class="card" href="/api/v1/health" target="_blank">
          <div>
            <span class="card-tag tag-green">${copy.telemetry}</span>
            <div class="card-title">${copy.healthTitle}</div>
            <div class="card-desc">${copy.healthDesc}</div>
          </div>
          <div class="card-url">/api/v1/health &rarr;</div>
        </a>
      </div>
    </div>

    <footer class="links-bar">
      <span>Moonwitness v${esc(data.version)}</span>
      &bull;
      <a href="/docs/json">OpenAPI JSON</a>
      &bull;
      <a href="/api/v1/metrics">Prometheus Metrics</a>
      &bull;
      <a href="/api/v1/studio">Studio Data</a>
      &bull;
      <a href="${aiUrl}/health" target="_blank">AI Gateway Health</a>
    </footer>
  </div>
</body>
</html>`
}
