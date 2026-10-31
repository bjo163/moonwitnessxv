#!/usr/bin/env node
/**
 * M46-21: Bundle Size Benchmark for empire-web
 * 
 * Measures initial vs lazy-loaded assets, reports sizes, and establishes baseline.
 * Run after `pnpm build` in apps/empire-web.
 */

import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { platform, arch, versions } from 'node:process'

const BUILD_DIR = join(process.cwd(), '.next')
const STATIC_DIR = join(BUILD_DIR, 'static')

async function getFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      await getFiles(fullPath, files)
    } else {
      const stats = await stat(fullPath)
      files.push({ path: fullPath, size: stats.size, name: entry.name })
    }
  }
  return files
}

function categorizeAsset(file) {
  const ext = file.name.split('.').pop()
  const isJS = ext === 'js'
  const isCSS = ext === 'css'
  
  // Initial assets: loaded on every page (layout, main chunks)
  // Lazy assets: route-specific chunks (loaded on demand)
  const isInitial = file.path.includes('/chunks/main') ||
                    file.path.includes('/chunks/webpack') ||
                    file.path.includes('/chunks/framework') ||
                    file.name.includes('main-') ||
                    file.name.includes('webpack-') ||
                    file.name.includes('framework-')
  
  return {
    type: isJS ? 'js' : isCSS ? 'css' : 'other',
    category: isInitial ? 'initial' : 'lazy',
    ...file
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function main() {
  console.log('# M46-21 Bundle Size Benchmark\n')
  console.log('## Environment\n')
  console.log(`- **Platform:** ${platform} ${arch}`)
  console.log(`- **Node.js:** ${versions.node}`)
  console.log(`- **Date:** ${new Date().toISOString()}`)
  console.log(`- **Build dir:** ${BUILD_DIR}\n`)
  
  const allFiles = await getFiles(STATIC_DIR)
  const assets = allFiles.map(categorizeAsset).filter(a => a.type === 'js' || a.type === 'css')
  
  const initial = assets.filter(a => a.category === 'initial')
  const lazy = assets.filter(a => a.category === 'lazy')
  
  const initialJS = initial.filter(a => a.type === 'js')
  const initialCSS = initial.filter(a => a.type === 'css')
  const lazyJS = lazy.filter(a => a.type === 'js')
  const lazyCSS = lazy.filter(a => a.type === 'css')
  
  const sum = (arr) => arr.reduce((acc, f) => acc + f.size, 0)
  
  console.log('## Summary\n')
  console.log('| Category | Type | Count | Total Size |')
  console.log('|----------|------|-------|------------|')
  console.log(`| Initial | JS | ${initialJS.length} | ${formatBytes(sum(initialJS))} |`)
  console.log(`| Initial | CSS | ${initialCSS.length} | ${formatBytes(sum(initialCSS))} |`)
  console.log(`| Initial | **Total** | **${initial.length}** | **${formatBytes(sum(initial))}** |`)
  console.log(`| Lazy | JS | ${lazyJS.length} | ${formatBytes(sum(lazyJS))} |`)
  console.log(`| Lazy | CSS | ${lazyCSS.length} | ${formatBytes(sum(lazyCSS))} |`)
  console.log(`| Lazy | **Total** | **${lazy.length}** | **${formatBytes(sum(lazy))}** |`)
  console.log(`| **Grand Total** | | **${assets.length}** | **${formatBytes(sum(assets))}** |\n`)
  
  console.log('## Initial Assets (loaded on every page)\n')
  console.log('| File | Size |')
  console.log('|------|------|')
  initial.sort((a, b) => b.size - a.size).forEach(f => {
    console.log(`| \`${f.name}\` | ${formatBytes(f.size)} |`)
  })
  
  console.log('\n## Lazy Assets (route-specific, loaded on demand)\n')
  console.log('| File | Size |')
  console.log('|------|------|')
  lazy.sort((a, b) => b.size - a.size).slice(0, 20).forEach(f => {
    console.log(`| \`${f.name}\` | ${formatBytes(f.size)} |`)
  })
  if (lazy.length > 20) {
    console.log(`\n_... and ${lazy.length - 20} more files_`)
  }
  
  console.log('\n## Baseline Proposal\n')
  const initialTotal = sum(initial)
  const initialJSTotal = sum(initialJS)
  console.log(`- **Initial JS budget:** ${formatBytes(initialJSTotal)} (current baseline)`)
  console.log(`- **Initial total budget:** ${formatBytes(initialTotal)} (current baseline)`)
  console.log(`- **Recommended threshold:** +10% = ${formatBytes(Math.round(initialTotal * 1.1))}`)
  console.log('\n_Rerun this benchmark after 2 stable builds to confirm baseline before gating._\n')
  
  console.log('## Largest Files (top 10)\n')
  assets.sort((a, b) => b.size - a.size).slice(0, 10).forEach((f, i) => {
    console.log(`${i + 1}. \`${f.name}\` — ${formatBytes(f.size)} (${f.category} ${f.type})`)
  })
}

main().catch(err => {
  console.error('Benchmark failed:', err)
  process.exit(1)
})
