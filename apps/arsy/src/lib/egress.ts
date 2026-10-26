import { lookup } from 'node:dns/promises'
import { configureEgress, egressRules } from '@moonwitness/core'
import type { AddressResolver } from '@moonwitness/core'
import type { RadioConfig } from '../config.js'

/**
 * The process-wide egress policy, installed once at boot.
 *
 * `@moonwitness/core` keeps the rules and cannot import `node:dns` (its main entry
 * has to stay usable in a browser bundle), so resolution is injected from here —
 * the one place that knows it is running under Node. Without this call the URL gate
 * still runs, but a public name that resolves to 127.0.0.1 would pass; that is the
 * gap this closes.
 *
 * `all: true` makes the check honest: a name with several A records fails when any
 * of them is private, not just the one the first fetch would pick.
 */
const nodeResolver: AddressResolver = async (host) => {
  const answers = await lookup(host, { all: true, verbatim: true })
  return answers.map((answer) => answer.address)
}

export function installEgress(config: Pick<RadioConfig, 'egress' | 'port'>): ReturnType<typeof egressRules> {
  configureEgress({
    denyHosts: config.egress.denyHosts,
    // the hub's own listening port: no catalog probe has any reason to call back
    // into the API that is running it
    denyPorts: [config.port],
    resolveAddresses: nodeResolver,
  })
  return egressRules()
}
