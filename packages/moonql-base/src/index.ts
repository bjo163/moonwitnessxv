import { ADMIN_WRITE, defineAddon, defineModel, defineView, m2o, sel, str } from '@moonwitness/moonql'
import { CURRENCIES } from './data/currencies.js'
import { LANGUAGES } from './data/languages.js'
import { COUNTRIES } from './data/countries.js'

/**
 * moonql-base — the reference-data addon (Odoo `base` module equivalent).
 * Countries, currencies and languages arrive COMPLETE as `data` tier:
 * diff-synced on every boot (insert new / update changed, never delete),
 * linked with declarative '@currencies:xxx' references.
 *
 * Model order matters: currencies and languages sync BEFORE countries so
 * the countries rows can resolve their references (reference phase walks
 * the registry in declaration order).
 */
export const base = defineAddon({
  name: 'base',
  version: '1.0.0',
  models: {
    currencies: defineModel({
      label: 'Currency',
      rest: true,
      maxLimit: 300,
      fields: {
        name: str({ maxLength: 80 }),
        code: str({ maxLength: 3 }),
        symbol: str({ maxLength: 6, null: true }),
      },
      unique: [['code']],
      acl: ADMIN_WRITE,
      data: { rows: CURRENCIES },
      menu: { group: 'Reference', icon: 'CU', order: 10 },
    }),
    languages: defineModel({
      label: 'Language',
      rest: true,
      maxLimit: 300,
      fields: {
        name: str({ maxLength: 80 }),
        code: str({ maxLength: 3 }),
      },
      unique: [['code']],
      acl: ADMIN_WRITE,
      data: { rows: LANGUAGES },
      menu: { group: 'Reference', icon: 'LG', order: 20 },
    }),
    countries: defineModel({
      label: 'Country',
      rest: true,
      maxLimit: 300,
      fields: {
        name: str({ maxLength: 96 }),
        code: str({ maxLength: 2 }),
        code3: str({ maxLength: 3, null: true }),
        calling: str({ maxLength: 8, null: true }),
        region: sel(['africa', 'americas', 'asia', 'europe', 'oceania'], { null: true }),
        currencyRef: m2o('currencies', { index: true }),
        officialLang: m2o('languages', { null: true }),
      },
      unique: [['code']],
      acl: ADMIN_WRITE,
      data: { rows: COUNTRIES },
      menu: { group: 'Reference', icon: 'CT', order: 30 },
    }),
  },
  views: {
    // complete, ready-bound select lists for any client ("selections must be complete")
    countryOptions: defineView('countryOptions', {
      label: 'Country select options',
      from: 'countries',
      select: { code: 'code', name: 'name', calling: 'calling' },
      order: 'name',
      limit: 300,
      menu: { group: 'Reference', order: 40 },
    }),
    currencyOptions: defineView('currencyOptions', {
      label: 'Currency select options',
      from: 'currencies',
      select: { code: 'code', name: 'name', symbol: 'symbol' },
      order: 'code',
      limit: 300,
      menu: { group: 'Reference', order: 41 },
    }),
  },
})

export default base
