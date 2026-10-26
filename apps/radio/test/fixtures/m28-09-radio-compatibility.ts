/** Frozen compatibility expectations derived from the pre-rename M22-01 fixture. */
export const M28_09_RADIO_COMPATIBILITY = {
  sourceSha: 'a1e384ef083ecf3c6fe4aae2b70acbdd6f2620cc',
  hub: {
    port: 3000,
    apiPrefix: '/api/v1',
    successEnvelopeKeys: ['data', 'ok', 'timestamp'],
    errorEnvelopeKeys: ['error', 'ok', 'timestamp'],
  },
  stations: {
    listPath: '/api/v1/stations?limit=100',
    seedCount: 36,
    activeCatalogPath: '/api/v1/stationCatalog?limit=100',
    activeCount: 35,
    sampleNaturalKey: 'Prambors FM Jakarta',
    inactiveNaturalKey: 'Amandit 93.9 FM',
    schedulePath: '/api/v1/weeklySchedule?limit=100',
    scheduleCount: 14,
  },
  player: {
    streamPath: '/api/v1/on-air?limit=1&seconds=5',
    timeshiftPathTemplate: '/api/v1/timeshift/stations/{id}/timeshift',
    timeshiftBeaconPathTemplate: '/api/v1/timeshift/stations/{id}/timeshift/beacon',
  },
  whatsapp: {
    channelsPath: '/api/v1/channels',
    anonymousStatus: 401,
    disabledChannelCount: 0,
  },
  denpa: {
    inboundPath: '/api/v1/denpa',
    transmitPath: '/api/v1/denpa/transmit',
    publicViewPath: '/api/v1/publicLiveTransmissions?limit=10',
    unauthorizedStatus: 401,
    acceptedStatus: 202,
    publicTransmitStatus: 201,
  },
} as const
