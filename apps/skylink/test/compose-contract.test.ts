import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const compose = readFileSync(`${ROOT}/docker-compose.yml`, 'utf8').replace(/\r\n/g, '\n')
const runtimeDockerfile = readFileSync(`${ROOT}/Dockerfile.skylink`, 'utf8').replace(/\r\n/g, '\n')
const arsyDockerfile = readFileSync(`${ROOT}/Dockerfile`, 'utf8').replace(/\r\n/g, '\n')

function serviceBlocks(): Map<string, string> {
  const lines = compose.split('\n')
  const start = lines.findIndex((line) => /^services:\s*$/.test(line))
  assert.ok(start >= 0, 'docker-compose.yml has a services section')

  const blocks = new Map<string, string>()
  let name: string | undefined
  let body: string[] = []
  for (const line of lines.slice(start + 1)) {
    const header = /^ {2}([a-z][a-z0-9_-]*):\s*$/.exec(line)
    if (header) {
      if (name) blocks.set(name, body.join('\n'))
      name = header[1]
      body = []
    } else if (/^\S/.test(line)) {
      if (name) blocks.set(name, body.join('\n'))
      break
    } else if (name) body.push(line)
  }
  return blocks
}

const services = serviceBlocks()

void test('compose: every service, including SKYLINK, has a healthcheck', () => {
  assert.ok(services.has('skylink'), 'SKYLINK remains a Compose service')
  const missing = [...services].filter(([, block]) => !/^ {4}healthcheck:/m.test(block)).map(([name]) => name)
  assert.deepEqual(missing, [], `services without healthchecks: ${missing.join(', ')}`)
})

void test('compose: SKYLINK has a loopback-published port, healthcheck, and no shared WhatsApp session', () => {
  const skylink = services.get('skylink')
  assert.ok(skylink, 'SKYLINK is a Compose service')
  assert.match(skylink, /profiles:\s*\["skylink"\]/, 'the optional service does not block the default stack')
  assert.match(skylink, /dockerfile:\s*Dockerfile\.skylink/)
  assert.match(skylink, /127\.0\.0\.1:3005:3005/)
  assert.match(skylink, /healthcheck:[\s\S]*?127\.0\.0\.1:3005\/health/)
  assert.match(skylink, /SKYLINK_SERVICE_KEY:\s*\$\{SKYLINK_SERVICE_KEY:-\}/)
  assert.match(skylink, /SKYLINK_TELEGRAM_BOT_TOKEN:\s*\$\{SKYLINK_TELEGRAM_BOT_TOKEN:-\}/)
  assert.match(skylink, /SKYLINK_TELEGRAM_WEBHOOK_SECRET:\s*\$\{SKYLINK_TELEGRAM_WEBHOOK_SECRET:-\}/)
  assert.doesNotMatch(skylink, /whatsapp-session|volumes:/, 'Telegram credentials do not use ARSY WhatsApp auth storage')
  assert.match(skylink, /db:[\s\S]*?condition: service_healthy/)
  assert.doesNotMatch(compose, /^\s{2}skylink-db:/m, 'SKYLINK reuses the existing database service')
})

void test('compose: ARSY receives the feature flag without depending on SKYLINK availability', () => {
  const arsy = services.get('arsy')
  assert.ok(arsy)
  assert.match(arsy, /SKYLINK_ENABLED:\s*\$\{SKYLINK_ENABLED:-false\}/)
  assert.match(arsy, /SKYLINK_URL:\s*http:\/\/skylink:3005/)
  assert.match(arsy, /SKYLINK_SERVICE_KEY:\s*\$\{SKYLINK_SERVICE_KEY:-\}/)
  const dependencies = /depends_on:([\s\S]*?)\n {4}ports:/.exec(arsy)?.[1] ?? ''
  assert.doesNotMatch(dependencies, /skylink:/, 'flag-off ARSY must not be blocked by SKYLINK health')
})

void test('runtime image builds the SKYLINK app and preserves the default ARSY image', () => {
  assert.match(runtimeDockerfile, /COPY apps\/skylink \.\/apps\/skylink/)
  assert.match(runtimeDockerfile, /pnpm --filter @moonwitness\/skylink build/)
  assert.match(runtimeDockerfile, /COPY --from=build \/repo\/packages\/skylink-store\/migrations packages\/skylink-store\/migrations/)
  assert.match(runtimeDockerfile, /COPY --from=build \/repo\/apps\/skylink\/dist apps\/skylink\/dist/)
  assert.match(runtimeDockerfile, /CMD \["node", "apps\/skylink\/dist\/index\.js"\]/)
  assert.match(arsyDockerfile, /CMD \["node", "apps\/arsy\/dist\/server\.js"\]/)
})
