import { spawn, exec } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const isWindows = process.platform === 'win32'

export interface LaunchOptions {
  url: string
  width?: number
  height?: number
  title?: string
}

function findWindowsAppBrowser(): string | null {
  const edgeCandidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    join(process.env.LOCALAPPDATA ?? '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    join(process.env['ProgramFiles(x86)'] ?? '', 'Microsoft\\Edge\\Application\\msedge.exe'),
    join(process.env.ProgramFiles ?? '', 'Microsoft\\Edge\\Application\\msedge.exe'),
  ]

  for (const candidate of edgeCandidates) {
    if (candidate && existsSync(candidate)) return candidate
  }

  const chromeCandidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    join(process.env.LOCALAPPDATA ?? '', 'Google\\Chrome\\Application\\chrome.exe'),
  ]

  for (const candidate of chromeCandidates) {
    if (candidate && existsSync(candidate)) return candidate
  }

  return null
}

export function launchDesktopApp(options: LaunchOptions): boolean {
  const { url, width = 1400, height = 880 } = options

  if (isWindows) {
    const browserBinary = findWindowsAppBrowser()
    if (browserBinary) {
      const profileDir = join(tmpdir(), 'moondeck-app-profile')
      const args = [
        `--app=${url}`,
        `--window-size=${width},${height}`,
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
      ]

      const child = spawn(browserBinary, args, {
        detached: true,
        stdio: 'ignore',
        windowsHide: false,
      })
      child.unref()
      return true
    }

    // Fallback on Windows: start command
    exec(`start "" "${url}"`)
    return true
  }

  // macOS
  if (process.platform === 'darwin') {
    exec(`open -na "Google Chrome" --args --app="${url}" || open "${url}"`)
    return true
  }

  // Linux
  exec(`google-chrome --app="${url}" || xdg-open "${url}"`)
  return true
}
