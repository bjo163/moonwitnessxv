import assert from 'node:assert/strict'
import test from 'node:test'
import process from 'node:process'
import { FRONTEND_URLS } from '@moonwitness/core'
import { getDockBaseUrl, getDockMetadata } from '../src/lib/metadata.ts'
import sitemap, { DOCK_SITEMAP_ROUTES } from '../src/app/sitemap.ts'
import manifest from '../src/app/manifest.ts'

test('metadata helper resolves Indonesian locale title, description, and canonical URL', () => {
  const meta = getDockMetadata('id', '/id')
  const defaultBase = FRONTEND_URLS.dock

  assert.equal(meta.title?.default, 'Moonwitness — radio larut malam')
  assert.equal(meta.title?.template, '%s — Moonwitness')
  assert.equal(meta.description, 'Radio larut malam, dikatalogkan langsung oleh hub.')

  assert.equal(meta.alternates?.canonical, `${defaultBase}/id`)
  assert.equal(meta.alternates?.languages?.id, `${defaultBase}/id`)
  assert.equal(meta.alternates?.languages?.en, `${defaultBase}/en`)
  assert.equal(meta.alternates?.languages?.['x-default'], `${defaultBase}/en`)

  assert.equal(meta.openGraph?.locale, 'id_ID')
  assert.deepEqual(meta.openGraph?.alternateLocale, ['en_US'])
  assert.equal(meta.openGraph?.title, 'Moonwitness — radio larut malam')
  assert.equal(meta.openGraph?.description, 'Radio larut malam, dikatalogkan langsung oleh hub.')
  assert.equal(meta.openGraph?.url, `${defaultBase}/id`)
  assert.equal(meta.openGraph?.siteName, 'Moonwitness')
  assert.equal(meta.openGraph?.type, 'website')
})

test('metadata helper resolves English locale title, description, and canonical URL', () => {
  const meta = getDockMetadata('en', '/en')
  const defaultBase = FRONTEND_URLS.dock

  assert.equal(meta.title?.default, 'Moonwitness — late-night radio')
  assert.equal(meta.title?.template, '%s — Moonwitness')
  assert.equal(meta.description, 'Late-night radio, catalogued by the hub itself.')

  assert.equal(meta.alternates?.canonical, `${defaultBase}/en`)
  assert.equal(meta.alternates?.languages?.id, `${defaultBase}/id`)
  assert.equal(meta.alternates?.languages?.en, `${defaultBase}/en`)
  assert.equal(meta.alternates?.languages?.['x-default'], `${defaultBase}/en`)

  assert.equal(meta.openGraph?.locale, 'en_US')
  assert.deepEqual(meta.openGraph?.alternateLocale, ['id_ID'])
  assert.equal(meta.openGraph?.title, 'Moonwitness — late-night radio')
  assert.equal(meta.openGraph?.description, 'Late-night radio, catalogued by the hub itself.')
  assert.equal(meta.openGraph?.url, `${defaultBase}/en`)
  assert.equal(meta.openGraph?.siteName, 'Moonwitness')
  assert.equal(meta.openGraph?.type, 'website')
})

test('metadata preserves subroutes and query parameters across canonical and alternates', () => {
  const defaultBase = FRONTEND_URLS.dock

  const termsMeta = getDockMetadata('id', '/id/terms')
  assert.equal(termsMeta.alternates?.canonical, `${defaultBase}/id/terms`)
  assert.equal(termsMeta.alternates?.languages?.id, `${defaultBase}/id/terms`)
  assert.equal(termsMeta.alternates?.languages?.en, `${defaultBase}/en/terms`)
  assert.equal(termsMeta.alternates?.languages?.['x-default'], `${defaultBase}/en/terms`)

  const stationsWithQuery = getDockMetadata('en', '/en/stations?genre=ambient&sort=newest')
  assert.equal(stationsWithQuery.alternates?.canonical, `${defaultBase}/en/stations?genre=ambient&sort=newest`)
  assert.equal(stationsWithQuery.alternates?.languages?.id, `${defaultBase}/id/stations?genre=ambient&sort=newest`)
  assert.equal(stationsWithQuery.alternates?.languages?.en, `${defaultBase}/en/stations?genre=ambient&sort=newest`)
  assert.equal(stationsWithQuery.alternates?.languages?.['x-default'], `${defaultBase}/en/stations?genre=ambient&sort=newest`)

  const unprefixedMeta = getDockMetadata('id', '/stations')
  assert.equal(unprefixedMeta.alternates?.canonical, `${defaultBase}/id/stations`)
  assert.equal(unprefixedMeta.alternates?.languages?.id, `${defaultBase}/id/stations`)
  assert.equal(unprefixedMeta.alternates?.languages?.en, `${defaultBase}/en/stations`)
})

test('metadata fails safe to English defaults when given invalid or missing locale', () => {
  const defaultBase = FRONTEND_URLS.dock

  const unsupportedMeta = getDockMetadata('fr', '/fr/stations')
  assert.equal(unsupportedMeta.title?.default, 'Moonwitness — late-night radio')
  assert.equal(unsupportedMeta.openGraph?.locale, 'en_US')
  assert.equal(unsupportedMeta.alternates?.canonical, `${defaultBase}/en`)

  const nullMeta = getDockMetadata(null, null)
  assert.equal(nullMeta.title?.default, 'Moonwitness — late-night radio')
  assert.equal(nullMeta.alternates?.canonical, `${defaultBase}/en`)

  const emptyMeta = getDockMetadata('', '')
  assert.equal(emptyMeta.title?.default, 'Moonwitness — late-night radio')
  assert.equal(emptyMeta.alternates?.canonical, `${defaultBase}/en`)
})

test('base URL is strictly grounded in FRONTEND_URLS.dock without fictitious domains', () => {
  const originalDockPublicUrl = process.env.DOCK_PUBLIC_URL
  const originalNextPublicUrl = process.env.NEXT_PUBLIC_SITE_URL

  try {
    delete process.env.DOCK_PUBLIC_URL
    delete process.env.NEXT_PUBLIC_SITE_URL

    const base = getDockBaseUrl()
    assert.equal(base, FRONTEND_URLS.dock)
    assert.equal(base, 'http://localhost:3001')
    assert.doesNotMatch(base, /example\.com|moonwitness\.fake|fictitious/)

    process.env.DOCK_PUBLIC_URL = 'https://preview.dock.moonwitness.internal/'
    assert.equal(getDockBaseUrl(), 'https://preview.dock.moonwitness.internal')

    const meta = getDockMetadata('id', '/id')
    assert.equal(meta.alternates?.canonical, 'https://preview.dock.moonwitness.internal/id')
  } finally {
    if (originalDockPublicUrl !== undefined) {
      process.env.DOCK_PUBLIC_URL = originalDockPublicUrl
    } else {
      delete process.env.DOCK_PUBLIC_URL
    }
    if (originalNextPublicUrl !== undefined) {
      process.env.NEXT_PUBLIC_SITE_URL = originalNextPublicUrl
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL
    }
  }
})

test('sitemap generates valid, bidirectional localized entries for all public routes', () => {
  const entries = sitemap()
  const defaultBase = FRONTEND_URLS.dock

  assert.ok(Array.isArray(entries))
  assert.equal(entries.length, DOCK_SITEMAP_ROUTES.length * 2)

  for (const route of DOCK_SITEMAP_ROUTES) {
    const idUrl = `${defaultBase}/id${route}`
    const enUrl = `${defaultBase}/en${route}`

    const idEntry = entries.find((e) => e.url === idUrl)
    assert.ok(idEntry, `Missing sitemap entry for ${idUrl}`)
    assert.equal(idEntry.alternates?.languages?.id, idUrl)
    assert.equal(idEntry.alternates?.languages?.en, enUrl)
    assert.equal(idEntry.alternates?.languages?.['x-default'], enUrl)

    const enEntry = entries.find((e) => e.url === enUrl)
    assert.ok(enEntry, `Missing sitemap entry for ${enUrl}`)
    assert.equal(enEntry.alternates?.languages?.id, idUrl)
    assert.equal(enEntry.alternates?.languages?.en, enUrl)
    assert.equal(enEntry.alternates?.languages?.['x-default'], enUrl)

    if (route === '') {
      assert.equal(idEntry.priority, 1.0)
      assert.equal(enEntry.priority, 1.0)
    } else {
      assert.equal(idEntry.priority, 0.8)
      assert.equal(enEntry.priority, 0.8)
    }
  }
})

test('manifest adheres to PWA standard and specifies lang en', () => {
  const result = manifest()

  assert.equal(result.name, 'Moonwitness — late-night radio')
  assert.equal(result.short_name, 'Moonwitness')
  assert.equal(result.description, 'Browse the catalog, see what is on air, and press play.')
  assert.equal(result.start_url, '/')
  assert.equal(result.display, 'standalone')
  assert.equal(result.lang, 'en')
  assert.equal(result.background_color, '#0b0d12')
  assert.equal(result.theme_color, '#0b0d12')
  assert.ok(Array.isArray(result.icons) && result.icons.length >= 2)
  for (const icon of result.icons) {
    assert.ok(icon.src)
    assert.ok(icon.sizes)
    assert.ok(icon.type)
  }
})
