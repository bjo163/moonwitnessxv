// Moondeck Client Cockpit Engine
let appConfig = null
let serviceStates = {}
let allLogs = []
let activeTagFilter = 'all'
let showErrorsOnly = false
let searchTerm = ''
let autoScroll = true

const $ = (id) => document.getElementById(id)

async function initCockpit() {
  updateClock()
  setInterval(updateClock, 1000)

  try {
    const res = await fetch('/api/config')
    appConfig = await res.json()
    document.title = appConfig.title || 'Moondeck // Mission Cockpit'
    $('brandTitle').textContent = appConfig.title || 'MOONDECK'

    renderFilterPills()
    renderPreviewShortcuts()
    await refreshStatus()
    setupSSE()
    setupTabHandlers()
    setupToolbarHandlers()
  } catch (err) {
    console.error('Failed to initialize Moondeck:', err)
  }
}

function updateClock() {
  const now = new Date()
  $('sysClock').textContent = now.toTimeString().split(' ')[0]
}

async function refreshStatus() {
  try {
    const res = await fetch('/api/status')
    const data = await res.json()
    if (data.services) {
      for (const s of data.services) {
        serviceStates[s.tag] = s
      }
      renderServiceCards()
      renderPortsGrid()
    }
    if (data.system) {
      $('sysUptime').textContent = `${Math.floor(data.system.uptime)}s`
    }
  } catch (err) {
    console.error('Failed to refresh status:', err)
  }
}

function renderServiceCards() {
  const container = $('serviceCards')
  if (!container || !appConfig) return

  container.innerHTML = ''
  for (const svc of appConfig.services) {
    const state = serviceStates[svc.tag] || {
      status: 'STOPPED',
      uptimeSeconds: 0,
      restarts: 0,
    }

    const card = document.createElement('div')
    card.className = 'service-card'
    card.style.borderLeft = `3px solid ${svc.color}`

    const isRunning = state.status === 'RUNNING'

    card.innerHTML = `
      <div class="card-top">
        <div class="card-identity">
          <span class="service-icon">${svc.icon || ''}</span>
          <span class="service-name">${svc.name}</span>
        </div>
        <span class="status-badge ${state.status}">${state.status}</span>
      </div>
      <div class="card-meta">
        ${svc.port ? `<span>PORT: <b>${svc.port}</b></span>` : '<span>TYPE: WORKER</span>'}
        ${state.pid ? `<span>PID: <b>${state.pid}</b></span>` : ''}
        ${state.uptimeSeconds > 0 ? `<span>UP: <b>${formatUptime(state.uptimeSeconds)}</b></span>` : ''}
      </div>
      <div class="card-desc">${svc.description || ''}</div>
      <div class="card-controls">
        ${
          isRunning
            ? `<button class="btn btn-danger btn-sm" onclick="controlService('${svc.tag}', 'stop')">Stop</button>
               <button class="btn btn-sm" onclick="controlService('${svc.tag}', 'restart')">Restart</button>`
            : `<button class="btn btn-primary btn-sm" onclick="controlService('${svc.tag}', 'start')">Start</button>`
        }
        ${
          svc.url
            ? `<button class="btn btn-sm" onclick="openPreview('${svc.url}')">Preview</button>`
            : ''
        }
      </div>
    `
    container.appendChild(card)
  }
}

function formatUptime(seconds) {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const remSecs = seconds % 60
  if (mins < 60) return `${mins}m ${remSecs}s`
  const hours = Math.floor(mins / 60)
  return `${hours}h ${mins % 60}m`
}

async function controlService(tag, action) {
  try {
    const res = await fetch(`/api/services/${tag}/${action}`, { method: 'POST' })
    const data = await res.json()
    if (data.state) {
      serviceStates[tag] = data.state
      renderServiceCards()
      renderPortsGrid()
    }
  } catch (err) {
    console.error(`Failed to ${action} ${tag}:`, err)
  }
}

async function startAll() {
  await fetch('/api/services/start-all', { method: 'POST' })
  await refreshStatus()
}

async function stopAll() {
  await fetch('/api/services/stop-all', { method: 'POST' })
  await refreshStatus()
}

async function freePorts() {
  const btn = $('btnFreePorts')
  btn.textContent = 'Freeing...'
  btn.disabled = true
  try {
    const res = await fetch('/api/ports/free', { method: 'POST' })
    const data = await res.json()
    alert(data.message || 'Ports freed')
  } catch (err) {
    alert('Failed to free ports: ' + err.message)
  } finally {
    btn.textContent = 'Free Ports'
    btn.disabled = false
    await refreshStatus()
  }
}

// SSE Log Streamer
function setupSSE() {
  const es = new EventSource('/api/logs/stream')

  es.addEventListener('init', (e) => {
    try {
      const logs = JSON.parse(e.data)
      allLogs = logs
      renderLogs()
    } catch {
      /* ignore */
    }
  })

  es.addEventListener('log', (e) => {
    try {
      const entry = JSON.parse(e.data)
      allLogs.push(entry)
      if (allLogs.length > 1000) allLogs.shift()
      appendLogLine(entry)
    } catch {
      /* ignore */
    }
  })

  es.addEventListener('state', (e) => {
    try {
      const state = JSON.parse(e.data)
      serviceStates[state.tag] = state
      renderServiceCards()
      renderPortsGrid()
    } catch {
      /* ignore */
    }
  })

  es.onerror = () => {
    console.warn('SSE disconnected, retrying in 3s...')
  }
}

function renderFilterPills() {
  const container = $('tagFilterPills')
  if (!container || !appConfig) return
  container.innerHTML = ''

  const allPill = document.createElement('button')
  allPill.className = `filter-pill ${activeTagFilter === 'all' ? 'active' : ''}`
  allPill.textContent = 'ALL'
  allPill.onclick = () => setTagFilter('all')
  container.appendChild(allPill)

  for (const svc of appConfig.services) {
    const pill = document.createElement('button')
    pill.className = `filter-pill ${activeTagFilter === svc.tag ? 'active' : ''}`
    pill.textContent = svc.tag.toUpperCase()
    pill.style.borderColor = activeTagFilter === svc.tag ? svc.color : ''
    pill.style.color = activeTagFilter === svc.tag ? svc.color : ''
    pill.onclick = () => setTagFilter(svc.tag)
    container.appendChild(pill)
  }
}

function setTagFilter(tag) {
  activeTagFilter = tag
  renderFilterPills()
  renderLogs()
}

function renderLogs() {
  const viewport = $('terminalViewport')
  if (!viewport) return
  viewport.innerHTML = ''

  const filtered = allLogs.filter((entry) => {
    if (activeTagFilter !== 'all' && entry.tag !== activeTagFilter) return false
    if (showErrorsOnly && entry.level !== 'error') return false
    if (searchTerm && !entry.message.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  for (const entry of filtered) {
    appendLogLine(entry, false)
  }

  if (autoScroll) {
    viewport.scrollTop = viewport.scrollHeight
  }
}

function appendLogLine(entry, checkScroll = true) {
  const viewport = $('terminalViewport')
  if (!viewport) return

  // Filter check
  if (activeTagFilter !== 'all' && entry.tag !== activeTagFilter) return
  if (showErrorsOnly && entry.level !== 'error') return
  if (searchTerm && !entry.message.toLowerCase().includes(searchTerm.toLowerCase())) return

  const svc = appConfig?.services.find((s) => s.tag === entry.tag)
  const tagColor = svc ? svc.color : '#00e5ff'

  const line = document.createElement('div')
  line.className = `log-line ${entry.level}`
  line.innerHTML = `
    <span class="log-time">${entry.timestamp.split(' ')[1] || entry.timestamp}</span>
    <span class="log-tag" style="background:${tagColor}22; color:${tagColor}; border:1px solid ${tagColor}44;">${entry.tag.toUpperCase()}</span>
    <span class="log-msg">${escapeHtml(entry.message)}</span>
  `

  viewport.appendChild(line)

  if (checkScroll && autoScroll) {
    viewport.scrollTop = viewport.scrollHeight
  }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Tab Switcher
function setupTabHandlers() {
  const tabs = document.querySelectorAll('.stage-tab')
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'))
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'))

      tab.classList.add('active')
      const targetId = tab.getAttribute('data-target')
      const panel = $(targetId)
      if (panel) panel.classList.add('active')

      if (targetId === 'tabLedger') loadErrorLedger()
    })
  })
}

function setupToolbarHandlers() {
  $('searchInput').addEventListener('input', (e) => {
    searchTerm = e.target.value
    renderLogs()
  })

  $('btnErrorsOnly').addEventListener('click', (e) => {
    showErrorsOnly = !showErrorsOnly
    e.target.classList.toggle('active', showErrorsOnly)
    renderLogs()
  })

  $('btnAutoScroll').addEventListener('click', (e) => {
    autoScroll = !autoScroll
    e.target.classList.toggle('active', autoScroll)
    if (autoScroll) {
      const v = $('terminalViewport')
      v.scrollTop = v.scrollHeight
    }
  })

  $('btnClearLogs').addEventListener('click', () => {
    allLogs = []
    renderLogs()
  })

  $('btnRefreshLedger')?.addEventListener('click', loadErrorLedger)
  $('btnClearLedger')?.addEventListener('click', clearErrorLedger)
}

// Web Preview Functionality
function renderPreviewShortcuts() {
  const container = $('previewShortcuts')
  if (!container || !appConfig) return
  container.innerHTML = ''

  const shortcuts = [
    { label: 'Dock (:3001)', url: 'http://127.0.0.1:3001' },
    { label: 'Headquarters (:3002)', url: 'http://127.0.0.1:3002' },
    { label: 'World Monitor (:3002/world-monitor)', url: 'http://127.0.0.1:3002/world-monitor' },
    { label: 'Hub (:3000)', url: 'http://127.0.0.1:3000' },
    { label: 'Swagger Docs (:3000/docs)', url: 'http://127.0.0.1:3000/docs' },
    { label: 'AI Gateway (:3003)', url: 'http://127.0.0.1:3003/v1/models' },
  ]

  for (const s of shortcuts) {
    const btn = document.createElement('button')
    btn.className = 'btn btn-sm'
    btn.textContent = s.label
    btn.onclick = () => openPreview(s.url)
    container.appendChild(btn)
  }
}

function openPreview(url) {
  // Switch to preview tab
  document.querySelectorAll('.stage-tab').forEach((t) => t.classList.remove('active'))
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'))

  const tab = document.querySelector('.stage-tab[data-target="tabPreview"]')
  if (tab) tab.classList.add('active')
  const panel = $('tabPreview')
  if (panel) panel.classList.add('active')

  $('previewUrlInput').value = url
  $('previewFrame').src = url
}

function navigatePreview() {
  const url = $('previewUrlInput').value
  if (url) $('previewFrame').src = url
}

function reloadPreview() {
  const frame = $('previewFrame')
  frame.src = frame.src
}

function openExternal() {
  const url = $('previewUrlInput').value
  if (url) window.open(url, '_blank')
}

// Error Ledger
async function loadErrorLedger() {
  const viewport = $('ledgerViewport')
  if (!viewport) return
  viewport.innerHTML = '<div style="color:var(--text-muted)">Loading error ledger...</div>'

  try {
    const res = await fetch('/api/errors')
    const data = await res.json()
    $('ledgerCount').textContent = `${data.total || 0} entries`

    if (!data.lines || data.lines.length === 0) {
      viewport.innerHTML = '<div style="color:var(--neon-green)">No errors recorded in dev-errors.log. All systems nominal.</div>'
      return
    }

    viewport.innerHTML = ''
    for (const line of data.lines) {
      const item = document.createElement('div')
      item.className = 'ledger-item'
      item.textContent = line
      viewport.appendChild(item)
    }
  } catch (err) {
    viewport.innerHTML = `<div style="color:var(--neon-red)">Failed to load errors: ${err.message}</div>`
  }
}

async function clearErrorLedger() {
  if (!confirm('Clear all logged errors?')) return
  try {
    await fetch('/api/errors', { method: 'DELETE' })
    await loadErrorLedger()
  } catch (err) {
    alert('Failed to clear: ' + err.message)
  }
}

// Network & Ports Grid
function renderPortsGrid() {
  const container = $('portsGrid')
  if (!container || !appConfig) return
  container.innerHTML = ''

  const portMap = [
    { port: 3000, name: 'Radio Core Hub', tag: 'radio', desc: 'Fastify Hub & OpenAPI' },
    { port: 3001, name: 'Public Radio Dock', tag: 'dock', desc: 'Next.js Station Player' },
    { port: 3002, name: 'Headquarters', tag: 'hq', desc: 'Next.js Mission Control & World Monitor' },
    { port: 3003, name: 'AI Gateway Router', tag: 'ai', desc: 'Cascading AI Gateway' },
    { port: 3004, name: 'Moondeck Cockpit', tag: 'cockpit', desc: 'Desktop Process Supervisor & GUI' },
  ]

  for (const item of portMap) {
    const state = serviceStates[item.tag]
    const isRunning = item.tag === 'cockpit' || (state && state.status === 'RUNNING')

    const card = document.createElement('div')
    card.className = 'port-card'
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span class="port-number">:${item.port}</span>
        <span class="status-badge ${isRunning ? 'RUNNING' : 'STOPPED'}">${isRunning ? 'BOUND' : 'IDLE'}</span>
      </div>
      <div style="font-weight:700; color:#fff; font-size:14px; margin-bottom:4px;">${item.name}</div>
      <div style="color:var(--text-muted); font-size:12px; margin-bottom:12px;">${item.desc}</div>
      <div>
        <a href="http://127.0.0.1:${item.port}" target="_blank" class="btn btn-sm" style="text-decoration:none;">Open :${item.port}</a>
      </div>
    `
    container.appendChild(card)
  }
}

// Boot
window.addEventListener('DOMContentLoaded', initCockpit)
