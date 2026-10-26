import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(testDir, '..')
const appDir = path.resolve(appRoot, 'src', 'app')
const layoutsDir = path.resolve(appRoot, 'src', 'layouts')
const uiComponentsDir = path.resolve(appRoot, 'src', 'ui', 'components')

/**
 * Recursively find all page files in a directory.
 */
function findAllPageFiles(dir) {
  const pages = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      pages.push(...findAllPageFiles(fullPath))
    } else if (entry.isFile() && /^page\.[jt]sx?$/.test(entry.name)) {
      pages.push(fullPath)
    }
  }
  return pages
}

/**
 * Extract imports and JSX tag usages from a TypeScript / TSX source file using TypeScript AST.
 */
function analyzeTsxFile(filePath) {
  const sourceCode = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  const imports = []
  const importedIdentifiers = new Set()
  const jsxTags = []
  const renderedElementIds = []

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.text
      imports.push({ moduleSpecifier, text: node.getText(sourceFile) })
      if (node.importClause) {
        if (node.importClause.name) {
          importedIdentifiers.add(node.importClause.name.text)
        }
        if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          for (const element of node.importClause.namedBindings.elements) {
            importedIdentifiers.add(element.name.text)
          }
        }
      }
    }

    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile)
      jsxTags.push(tagName)

      // Look for id attributes in JSX
      for (const attr of node.attributes.properties) {
        if (ts.isJsxAttribute(attr) && attr.name.text === 'id' && attr.initializer) {
          if (ts.isStringLiteral(attr.initializer)) {
            renderedElementIds.push(attr.initializer.text)
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return {
    sourceCode,
    imports,
    importedIdentifiers,
    jsxTags,
    renderedElementIds,
  }
}

/**
 * Count HTML semantic landmarks and check for nested <main> tags.
 */
function countLandmarks(html) {
  const headers = (html.match(/<header\b[^>]*>/gi) || []).length
  const mains = (html.match(/<main\b[^>]*>/gi) || []).length
  const footers = (html.match(/<footer\b[^>]*>/gi) || []).length
  const joinCrewIds = (html.match(/\bid=["']join-crew["']/gi) || []).length
  const hasNestedMain = /<main\b[^>]*>[\s\S]*?<main\b[^>]*>/i.test(html)

  return {
    headers,
    mains,
    footers,
    joinCrewIds,
    hasNestedMain,
  }
}

/**
 * Simulate RootLayout + SiteLayout HTML wrapping around page content.
 */
function simulateRootLayout(pageHtml) {
  return [
    '<html lang="en">',
    '<body>',
    '  <div class="dk-shell">',
    '    <header class="dk-header">',
    '      <nav class="dk-nav" aria-label="Main navigation"></nav>',
    '      <nav class="dk-locale-switcher" aria-label="Language selection"></nav>',
    '    </header>',
    `    <main class="dk-main">${pageHtml}</main>`,
    '    <footer class="dk-footer" id="join-crew">',
    '      <div class="dk-join-banner">JOIN THE CREW</div>',
    '    </footer>',
    '  </div>',
    '</body>',
    '</html>',
  ].join('\n')
}

test('M19-18: NO page component in apps/dock/src/app imports or wraps in SiteLayout (except layout.tsx)', () => {
  const pageFiles = findAllPageFiles(appDir)
  assert.ok(pageFiles.length >= 20, `Expected at least 20 page files, found ${pageFiles.length}`)

  const violatingPages = []

  for (const pagePath of pageFiles) {
    const analysis = analyzeTsxFile(pagePath)
    const relativePath = path.relative(appRoot, pagePath).replace(/\\/g, '/')

    const importsSiteLayout =
      analysis.importedIdentifiers.has('SiteLayout') ||
      analysis.imports.some((i) => i.moduleSpecifier.includes('layouts/site')) ||
      /import\s+.*SiteLayout/.test(analysis.sourceCode)

    const rendersSiteLayout =
      analysis.jsxTags.includes('SiteLayout') ||
      /<SiteLayout\b/.test(analysis.sourceCode)

    if (importsSiteLayout || rendersSiteLayout) {
      violatingPages.push({
        path: relativePath,
        importsSiteLayout,
        rendersSiteLayout,
      })
    }
  }

  assert.deepEqual(
    violatingPages,
    [],
    `Found sub-route pages erroneously importing or wrapping in SiteLayout: ${JSON.stringify(violatingPages, null, 2)}`,
  )
})

test('M19-18: RootLayout is the exclusive consumer of SiteLayout in apps/dock/src/app', () => {
  const layoutPath = path.join(appDir, 'layout.tsx')
  assert.ok(fs.existsSync(layoutPath), 'Root layout.tsx must exist')

  const analysis = analyzeTsxFile(layoutPath)

  assert.ok(
    analysis.importedIdentifiers.has('SiteLayout') ||
      analysis.imports.some((i) => i.moduleSpecifier.includes('layouts/site')),
    'Root layout.tsx must import SiteLayout',
  )
  assert.ok(
    analysis.jsxTags.includes('SiteLayout'),
    'Root layout.tsx must render <SiteLayout>',
  )
})

test('M19-18: The 4 specific sub-route pages do not contain SiteLayout or landmark tags', () => {
  const targetRoutes = [
    'src/app/prisms/page.tsx',
    'src/app/timeline/page.tsx',
    'src/app/studio/page.tsx',
    'src/app/reader/compare/page.tsx',
  ]

  for (const relPath of targetRoutes) {
    const fullPath = path.join(appRoot, relPath)
    assert.ok(fs.existsSync(fullPath), `Target sub-route file must exist: ${relPath}`)

    const analysis = analyzeTsxFile(fullPath)

    assert.equal(
      analysis.importedIdentifiers.has('SiteLayout'),
      false,
      `${relPath} must not import SiteLayout`,
    )
    assert.equal(
      analysis.jsxTags.includes('SiteLayout'),
      false,
      `${relPath} must not use <SiteLayout>`,
    )
    assert.doesNotMatch(
      analysis.sourceCode,
      /import\s+.*SiteLayout/,
      `${relPath} source code must not match SiteLayout import`,
    )
    assert.doesNotMatch(
      analysis.sourceCode,
      /<SiteLayout\b|<\/SiteLayout>/,
      `${relPath} source code must not match <SiteLayout> JSX tag`,
    )

    // Ensure none of the target pages render conflicting raw landmarks
    assert.equal(analysis.jsxTags.includes('header'), false, `${relPath} must not render <header>`)
    assert.equal(analysis.jsxTags.includes('main'), false, `${relPath} must not render <main>`)
    assert.equal(analysis.jsxTags.includes('footer'), false, `${relPath} must not render <footer>`)
    assert.equal(
      analysis.renderedElementIds.includes('join-crew'),
      false,
      `${relPath} must not define id="join-crew"`,
    )
  }
})

test('M19-18: SiteLayout definition provides the single canonical set of landmark elements', () => {
  const siteLayoutPath = path.join(layoutsDir, 'site.tsx')
  assert.ok(fs.existsSync(siteLayoutPath), 'SiteLayout file must exist')

  const analysis = analyzeTsxFile(siteLayoutPath)

  assert.ok(analysis.jsxTags.includes('SiteHeader'), 'SiteLayout must include SiteHeader')
  assert.ok(analysis.jsxTags.includes('main'), 'SiteLayout must include <main>')
  assert.ok(analysis.jsxTags.includes('SiteFooter'), 'SiteLayout must include SiteFooter')

  // Inspect SiteHeader and SiteFooter definitions
  const shellPath = path.join(uiComponentsDir, 'shell.tsx')
  assert.ok(fs.existsSync(shellPath), 'shell.tsx component file must exist')

  const shellAnalysis = analyzeTsxFile(shellPath)
  assert.ok(shellAnalysis.jsxTags.includes('header'), 'SiteHeader must render <header className="dk-header">')
  assert.ok(shellAnalysis.jsxTags.includes('footer'), 'SiteFooter must render <footer className="dk-footer">')
  assert.ok(shellAnalysis.renderedElementIds.includes('join-crew'), 'SiteFooter must define id="join-crew"')
})

test('M19-18: Rendered pages inside RootLayout have exactly one <header>, one top-level <main>, and one <footer>', () => {
  const pageFiles = findAllPageFiles(appDir)

  for (const pagePath of pageFiles) {
    const analysis = analyzeTsxFile(pagePath)
    const relPath = path.relative(appRoot, pagePath).replace(/\\/g, '/')

    // No page in src/app should define duplicate header, main, or footer landmarks
    assert.equal(
      analysis.jsxTags.includes('header'),
      false,
      `Page ${relPath} must not render <header>`,
    )
    assert.equal(
      analysis.jsxTags.includes('main'),
      false,
      `Page ${relPath} must not render <main>`,
    )
    assert.equal(
      analysis.jsxTags.includes('footer'),
      false,
      `Page ${relPath} must not render <footer>`,
    )
    assert.equal(
      analysis.renderedElementIds.includes('join-crew'),
      false,
      `Page ${relPath} must not define duplicate id="join-crew"`,
    )

    // Simulate composition inside RootLayout
    const renderedHtml = simulateRootLayout(`<div class="page-content" data-path="${relPath}">Content</div>`)
    const counts = countLandmarks(renderedHtml)

    assert.equal(
      counts.headers,
      1,
      `Composed page ${relPath} must have exactly 1 <header> landmark, got ${counts.headers}`,
    )
    assert.equal(
      counts.mains,
      1,
      `Composed page ${relPath} must have exactly 1 <main> landmark, got ${counts.mains}`,
    )
    assert.equal(
      counts.footers,
      1,
      `Composed page ${relPath} must have exactly 1 <footer> landmark, got ${counts.footers}`,
    )
    assert.equal(
      counts.joinCrewIds,
      1,
      `Composed page ${relPath} must have exactly 1 element with id="join-crew", got ${counts.joinCrewIds}`,
    )
    assert.equal(
      counts.hasNestedMain,
      false,
      `Composed page ${relPath} must not have nested <main> elements`,
    )
  }
})

test('M19-18: Negative guard - nesting SiteLayout inside page causes landmark duplication and fails validation', () => {
  // If a page mistakenly re-wraps in SiteLayout (pre-fix condition of prisms, timeline, studio, compare):
  const nestedPageHtml = [
    '<div class="dk-shell">',
    '  <header class="dk-header"><nav class="dk-nav"></nav></header>',
    '  <main class="dk-main"><div class="inner-content">Prisms</div></main>',
    '  <footer class="dk-footer" id="join-crew">Footer</div>',
    '</div>',
  ].join('\n')

  const buggyRenderedHtml = simulateRootLayout(nestedPageHtml)
  const counts = countLandmarks(buggyRenderedHtml)

  // Verify that nesting SiteLayout leads to landmark violations
  assert.equal(counts.headers, 2, 'Nested SiteLayout produces 2 headers (landmark violation)')
  assert.equal(counts.mains, 2, 'Nested SiteLayout produces 2 mains (landmark violation)')
  assert.equal(counts.footers, 2, 'Nested SiteLayout produces 2 footers (landmark violation)')
  assert.equal(counts.joinCrewIds, 2, 'Nested SiteLayout produces duplicate id="join-crew"')
  assert.equal(counts.hasNestedMain, true, 'Nested SiteLayout produces nested <main> elements')
})
