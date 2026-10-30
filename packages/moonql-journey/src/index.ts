import {
  ADMIN_WRITE,
  bool,
  defineAddon,
  defineModel,
  defineView,
  m2o,
  sel,
  str,
  text,
  ts,
} from '@moonwitness/moonql'
import {
  PATCH_STATUSES,
  THEMATIC_FOCUSES,
  CONSENT_SCOPES,
  MANDATE_STATUSES,
  WORLD_PATCH_SEED,
} from './seed.js'

export * from './seed.js'
export * from './consent-scope.js'
export * from './real-world-action-metrics.js'

/**
 * @moonwitness/moonql-journey — Domain D11 Journey & 33 World Patches (Milestone M23)
 *
 * Provides declarative persistence for the authentic 33 World Patches, explicitly
 * preserving the slot 014 numbering conflict, slot 033 user submission status,
 * and accountable voluntary human-owned mandates with zero fabricated claims.
 */
export default defineAddon({
  name: 'journey',
  models: {
    journey_patches: defineModel({
      label: 'World Patch',
      rest: true,
      maxLimit: 100,
      fields: {
        slot: str({ maxLength: 16 }),
        title: str({ maxLength: 120 }),
        disputedTitle: str({ maxLength: 120, null: true }),
        status: sel(PATCH_STATUSES, { default: 'EDITORIAL_PROPOSAL', index: true }),
        thematicFocus: sel(THEMATIC_FOCUSES, { default: 'COMMUNITY', index: true }),
        scope: sel(CONSENT_SCOPES, { default: 'COMMUNITY' }),
        description: text({ null: true }),
        historicalNotes: text({ null: true }),
        active: bool({ default: true }),
      },
      unique: [['slot']],
      acl: ADMIN_WRITE,
      menu: { group: 'Journey', icon: 'WP', order: 10 },
      seed: WORLD_PATCH_SEED,
    }),

    journey_mandates: defineModel({
      label: 'Voluntary Mandate',
      rest: true,
      maxLimit: 100,
      fields: {
        patchRef: m2o('journey_patches', { null: true, index: true }),
        title: str({ maxLength: 160 }),
        operatorPseudonym: str({ maxLength: 80 }),
        deliverableDesc: text(),
        status: sel(MANDATE_STATUSES, { default: 'ACTIVE', index: true }),
        expiresAt: ts(),
      },
      acl: ADMIN_WRITE,
      menu: { group: 'Journey', icon: 'MD', order: 20 },
      seed: [
        {
          patchRef: '@journey_patches:019',
          title: 'Decentralized Provenance Verification Harness',
          operatorPseudonym: 'archivist_prime',
          deliverableDesc: 'Automated cryptographic watermarking for passage citations and immutable source verification.',
          status: 'ACTIVE',
          expiresAt: '2027-12-31T23:59:59.000Z',
        },
        {
          patchRef: '@journey_patches:022',
          title: 'Clean Water Sensor Network Prototype',
          operatorPseudonym: 'salak_steward',
          deliverableDesc: 'Open hardware telemetry for mountain spring purity and watershed conservation monitoring.',
          status: 'ACTIVE',
          expiresAt: '2027-06-30T23:59:59.000Z',
        },
      ],
    }),
  },

  views: {
    journeyPatchesOverview: defineView('journeyPatchesOverview', {
      label: 'Journey Patches Overview',
      from: 'journey_patches',
      where: { active: true },
      order: 'slot',
      limit: 100,
      menu: { group: 'Journey', icon: 'OV', order: 1 },
    }),

    activeMandates: defineView('activeMandates', {
      label: 'Active Voluntary Mandates',
      from: 'journey_mandates',
      where: { status: 'ACTIVE' },
      order: 'expiresAt',
      limit: 50,
      expand: ['patchRef'],
      menu: { group: 'Journey', icon: 'AM', order: 2 },
    }),
  },
})
