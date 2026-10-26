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

export function renderLaunchpadHtml(data: LaunchpadData): string {
  const dockUrl = data.frontends?.dock ?? 'http://localhost:3001'
  const hqUrl = data.frontends?.headquarters ?? 'http://localhost:3002'
  const aiUrl = 'http://localhost:3003'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name} · Dev Mission Control</title>
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
        <span style="font-family: var(--font-mono); font-size: 12px; color: var(--green);">MONOREPO ACTIVE</span>
      </div>
      <h1>${data.name} Mission Control</h1>
      <p class="subtitle">Central dev portal & service navigator for broadcast, intelligence, and AI systems.</p>
    </header>

    <div class="status-bar">
      <div class="status-item"><span class="dot"></span> Radio Core: <strong>:3000</strong></div>
      <div class="status-item"><span class="dot"></span> Dock: <strong>:3001</strong></div>
      <div class="status-item"><span class="dot"></span> Headquarters: <strong>:3002</strong></div>
      <div class="status-item"><span class="dot"></span> AI Gateway: <strong>:3003</strong></div>
      <div class="status-item" style="margin-left: auto;">Engine: <strong>${data.engine}</strong></div>
    </div>

    <div>
      <div class="section-title">Frontends & Public Surfaces</div>
      <div class="grid">
        <a class="card" href="${dockUrl}" target="_blank">
          <div>
            <span class="card-tag tag-pink">Public Broadcast</span>
            <div class="card-title">📻 Public Radio Dock</div>
            <div class="card-desc">Live audio stream, now-playing card, weekly schedule grid, and World Monitor live ticker.</div>
          </div>
          <div class="card-url">${dockUrl} &rarr;</div>
        </a>

        <a class="card" href="${hqUrl}" target="_blank">
          <div>
            <span class="card-tag tag-purple">Administration</span>
            <div class="card-title">🏛️ Headquarters (HQ)</div>
            <div class="card-desc">Mission control dashboard, database model inspection, CRUD station management, and ops view.</div>
          </div>
          <div class="card-url">${hqUrl} &rarr;</div>
        </a>

        <a class="card" href="${hqUrl}/world-monitor" target="_blank">
          <div>
            <span class="card-tag tag-yellow">OSINT & Surveillance</span>
            <div class="card-title">🛰️ World Monitor 3-Tier</div>
            <div class="card-desc">Drilldown UI across Radars, Sources (YouTube, X, RSS), and captured Signals with AI triage.</div>
          </div>
          <div class="card-url">${hqUrl}/world-monitor &rarr;</div>
        </a>
      </div>
    </div>

    <div>
      <div class="section-title">Engines, APIs & Documentation</div>
      <div class="grid">
        <a class="card" href="/docs" target="_blank">
          <div>
            <span class="card-tag tag-cyan">Developer Contract</span>
            <div class="card-title">⚡ OpenAPI Swagger Docs</div>
            <div class="card-desc">Interactive Swagger UI testing surface with auto-generated endpoints, models, and schemas.</div>
          </div>
          <div class="card-url">/docs &rarr;</div>
        </a>

        <a class="card" href="${aiUrl}/v1/models" target="_blank">
          <div>
            <span class="card-tag tag-yellow">Free-First Router</span>
            <div class="card-title">🧠 AI Gateway Router</div>
            <div class="card-desc">OpenAI-compatible chat completions with Gemini, Groq, OpenRouter, Ollama, & Heuristic fallback.</div>
          </div>
          <div class="card-url">${aiUrl}/v1/models &rarr;</div>
        </a>

        <a class="card" href="/api/v1/health" target="_blank">
          <div>
            <span class="card-tag tag-green">Telemetry</span>
            <div class="card-title">🩺 Health & Metrics</div>
            <div class="card-desc">Service health status, memory usage, Prometheus telemetry, and ORM bus metrics.</div>
          </div>
          <div class="card-url">/api/v1/health &rarr;</div>
        </a>
      </div>
    </div>

    <footer class="links-bar">
      <span>Moonwitness v${data.version}</span>
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
