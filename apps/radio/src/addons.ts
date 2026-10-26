import base from '@moonwitness/moonql-base'
import stations from '@moonwitness/moonql-stations'
import auth from '@moonwitness/moonql-auth'
import schedule from '@moonwitness/moonql-schedule'
import playlog from '@moonwitness/moonql-playlog'
import apikeys from '@moonwitness/moonql-apikeys'
import settings from '@moonwitness/moonql-settings'
import ops from '@moonwitness/moonql-ops'
import monitor from '@moonwitness/moonql-monitor'
import type { AnyAddon } from '@moonwitness/moonql'

/**
 * THE single wiring point for moonql addons (standard: packages/moonql-*).
 * Adding a feature = install its package + one line here.
 * Order is irrelevant — the registry topologically sorts by `depends`.
 */
export const addons: AnyAddon[] = [base, auth, stations, schedule, playlog, apikeys, settings, ops, monitor]
