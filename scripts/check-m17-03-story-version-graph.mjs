#!/usr/bin/env node
/**
 * M17-03 validator — story world/arc/episode/scene/manuscript-version graph.
 *
 * Dependency-free. Reads docs/data/M17-03-story-version-graph.json plus the
 * cited repository lines and docs/design/M17-03-story-version-graph.md.
 * No network. No writes.
 *
 * Usage:
 *   node scripts/check-m17-03-story-version-graph.mjs
 *   node scripts/check-m17-03-story-version-graph.mjs --self-test
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const DATA_FILE = path.join(ROOT, 'docs', 'data', 'M17-03-story-version-graph.json')
const DESIGN_FILE = path.join(ROOT, 'docs', 'design', 'M17-03-story-version-graph.md')

const NODE_KINDS = ['world', 'arc', 'episode', 'scene', 'manuscript_version']
const LABEL_CLASSES = ['heading_label', 'patch_title_label', 'episode_label', 'version_family_ref']
const REQUIRED_EDGES = ['world_contains_arc', 'arc_contains_episode', 'episode_contains_scene', 'version_of', 'version_derived_from']
const REQUIRED_INVARIANTS = [
  'INV-HEADING-NOT-ORIGINAL',
  'INV-LABEL-NOT-NODE',
  'INV-VERSION-PARENT',
  'INV-NO-PHANTOM-REFERENT',
  'INV-TALLY-MATCH',
  'INV-QUOTE-RESOLVES',
  'INV-DERIVATION-FORBIDDEN',
  'INV-ABSENT-NOT-FILLED',
]
const REQUIRED_RULES = ['CR-01', 'CR-02', 'CR-03', 'CR-04', 'CR-05', 'CR-06', 'CR-07', 'CR-08', 'CR-09']
const REQUIRED_INFERENCES = ['FI-01', 'FI-02', 'FI-03', 'FI-04', 'FI-05', 'FI-06', 'FI-07', 'FI-08']
const FORBIDDEN_DERIVATIONS = [
  'heading_label_to_node',
  'heading_label_to_manuscript_version',
  'heading_count_to_original_count',
  'patch_title_to_completed_patch',
  'book_count_to_recovered_book',
  'synopsis_count_to_transcript_count',
  'label_repetition_to_identity',
]
const STATUSES = ['EVIDENCED', 'LABEL_ONLY', 'NEEDS_SOURCE', 'ABSENT']

const err = (code, message) => ({ code, message })
const has = (value, message) => err('SHAPE', `${message} (got ${JSON.stringify(value)})`)

function makeReader(root) {
  const cache = new Map()
  return function read(rel) {
    if (typeof rel !== 'string' || !rel || rel.startsWith('/') || /^[A-Za-z]:/.test(rel) || rel.split(/[\\/]/).includes('..')) {
      return { error: 'PATH_UNSAFE' }
    }
    if (cache.has(rel)) return cache.get(rel)
    const abs = path.join(root, rel)
    let text
    try {
      text = fs.readFileSync(abs, 'utf8')
    } catch {
      const miss = { error: 'FILE_MISSING' }
      cache.set(rel, miss)
      return miss
    }
    const entry = { lines: text.split(/\r?\n/) }
    cache.set(rel, entry)
    return entry
  }
}

function checkLocator(read, src, where, errs) {
  if (!src || typeof src !== 'object') {
    errs.push(err('LOCATOR_MISSING', `${where}: missing source object`))
    return false
  }
  if (typeof src.file !== 'string' || !Number.isInteger(src.line) || typeof src.quote !== 'string' || !src.quote) {
    errs.push(err('LOCATOR_MISSING', `${where}: source needs file, integer line and non-empty quote`))
    return false
  }
  const got = read(src.file)
  if (got.error === 'PATH_UNSAFE') {
    errs.push(err('PATH_UNSAFE', `${where}: unsafe path ${JSON.stringify(src.file)}`))
    return false
  }
  if (got.error === 'FILE_MISSING') {
    errs.push(err('FILE_MISSING', `${where}: file not found ${src.file}`))
    return false
  }
  if (src.line < 1 || src.line > got.lines.length) {
    errs.push(err('LOCATOR_RANGE', `${where}: ${src.file}:${src.line} outside 1..${got.lines.length}`))
    return false
  }
  const lineText = got.lines[src.line - 1]
  if (!lineText.includes(src.quote)) {
    errs.push(err('QUOTE_MISMATCH', `${where}: quote not found verbatim at ${src.file}:${src.line}: ${JSON.stringify(src.quote)}`))
    return false
  }
  return true
}

function lint(data, { read, designText }) {
  const errors = []
  const stats = {
    quotes: 0,
    docEvidence: 0,
    labelRows: {},
    nodes: 0,
    edges: 0,
  }

  if (!data || typeof data !== 'object') {
    return { errors: [err('SHAPE', 'dataset is not an object')], stats }
  }
  if (data.task !== 'M17-03') errors.push(has(data.task, 'task must be M17-03'))
  if (data.acceptance !== '99 chapter headings not treated as 99 originals') {
    errors.push(has(data.acceptance, 'acceptance sentence drifted'))
  }
  if (typeof data.baseline_sha !== 'string' || !/^[0-9a-f]{40}$/.test(data.baseline_sha)) {
    errors.push(has(data.baseline_sha, 'baseline_sha must be a full 40-hex SHA'))
  }

  const evidence = Array.isArray(data.doc_evidence) ? data.doc_evidence : []
  const evidenceIds = new Set()
  for (const [i, item] of evidence.entries()) {
    const where = `doc_evidence[${i}]`
    if (!item || typeof item.id !== 'string' || !/^E\d{2}$/.test(item.id)) {
      errors.push(has(item && item.id, `${where}: id must be E##`))
      continue
    }
    if (evidenceIds.has(item.id)) errors.push(err('DUPLICATE_ID', `${where}: duplicate evidence id ${item.id}`))
    evidenceIds.add(item.id)
    if (checkLocator(read, item, where, errors)) stats.quotes += 1
  }
  stats.docEvidence = evidence.length

  const kinds = Array.isArray(data.node_kinds) ? data.node_kinds.map((k) => k && k.id) : []
  if (kinds.length !== NODE_KINDS.length || NODE_KINDS.some((k) => !kinds.includes(k))) {
    errors.push(err('NODE_KIND_SET', `node_kinds must be exactly ${NODE_KINDS.join(',')} (got ${kinds.join(',')})`))
  }
  for (const kind of NODE_KINDS) {
    const row = (data.node_kinds || []).find((k) => k && k.id === kind)
    if (!row) continue
    if (row.is_node !== true) errors.push(err('LABEL_AS_NODE', `node kind ${kind} must set is_node true`))
    if (!Array.isArray(row.parent_kinds) || row.parent_kinds.some((p) => !NODE_KINDS.includes(p))) {
      errors.push(has(row.parent_kinds, `node kind ${kind}: parent_kinds must use node kinds`))
    }
    if (!Array.isArray(row.evidence_refs) || row.evidence_refs.length === 0) {
      errors.push(err('EVIDENCE_REF_MISSING', `node kind ${kind} has no evidence_refs`))
    } else {
      for (const ref of row.evidence_refs) {
        if (!evidenceIds.has(ref)) errors.push(err('EVIDENCE_REF_MISSING', `node kind ${kind}: unknown evidence ref ${ref}`))
      }
    }
  }

  const labels = Array.isArray(data.label_classes) ? data.label_classes.map((l) => l && l.id) : []
  if (labels.length !== LABEL_CLASSES.length || LABEL_CLASSES.some((l) => !labels.includes(l))) {
    errors.push(err('LABEL_CLASS_SET', `label_classes must be exactly ${LABEL_CLASSES.join(',')} (got ${labels.join(',')})`))
  }
  for (const cls of LABEL_CLASSES) {
    const row = (data.label_classes || []).find((l) => l && l.id === cls)
    if (!row) continue
    if (row.is_node !== false) errors.push(err('LABEL_AS_NODE', `label class ${cls} must set is_node false`))
    if (NODE_KINDS.includes(cls)) errors.push(err('LABEL_AS_NODE', `label class ${cls} was promoted to a node kind`))
    for (const ref of row.evidence_refs || []) {
      if (!evidenceIds.has(ref)) errors.push(err('EVIDENCE_REF_MISSING', `label class ${cls}: unknown evidence ref ${ref}`))
    }
  }

  const edges = Array.isArray(data.edge_types) ? data.edge_types : []
  const edgeIds = new Set()
  for (const [i, edge] of edges.entries()) {
    const where = `edge_types[${i}]`
    if (!edge || typeof edge.id !== 'string') {
      errors.push(has(edge && edge.id, `${where}: id missing`))
      continue
    }
    if (edgeIds.has(edge.id)) errors.push(err('DUPLICATE_ID', `${where}: duplicate edge id ${edge.id}`))
    edgeIds.add(edge.id)
    const fromOk = NODE_KINDS.includes(edge.from)
    const toList = Array.isArray(edge.to) ? edge.to : [edge.to]
    if (!fromOk || toList.some((t) => !NODE_KINDS.includes(t))) {
      errors.push(err('EDGE_KIND', `${where}: edge may only join node kinds`))
    }
    for (const ref of edge.evidence_refs || []) {
      if (!evidenceIds.has(ref)) errors.push(err('EVIDENCE_REF_MISSING', `${where}: unknown evidence ref ${ref}`))
    }
  }
  for (const needed of REQUIRED_EDGES) {
    if (!edgeIds.has(needed)) errors.push(err('EDGE_MISSING', `required edge type ${needed} is missing`))
  }

  const rules = Array.isArray(data.cardinality_rules) ? data.cardinality_rules.map((r) => r && r.id) : []
  for (const needed of REQUIRED_RULES) {
    if (!rules.includes(needed)) errors.push(err('RULE_MISSING', `required cardinality rule ${needed} is missing`))
  }

  const invariants = Array.isArray(data.invariants) ? data.invariants : []
  for (const needed of REQUIRED_INVARIANTS) {
    const row = invariants.find((r) => r && r.id === needed)
    if (!row) errors.push(err('MISSING_INVARIANT', `required invariant ${needed} is missing`))
    else if (row.enforced !== true) errors.push(err('MISSING_INVARIANT', `invariant ${needed} is not enforced`))
  }
  const headingInv = invariants.find((r) => r && r.id === 'INV-HEADING-NOT-ORIGINAL')
  if (headingInv && !/never/.test(headingInv.statement || '')) {
    errors.push(err('INVARIANT_WEAKENED', 'INV-HEADING-NOT-ORIGINAL must state that N headings never imply N originals'))
  }

  const inferences = Array.isArray(data.forbidden_inferences) ? data.forbidden_inferences : []
  for (const needed of REQUIRED_INFERENCES) {
    const row = inferences.find((r) => r && r.id === needed)
    if (!row) errors.push(err('MISSING_INFERENCE', `required forbidden inference ${needed} is missing`))
    else if (row.forbidden !== true) errors.push(err('MISSING_INFERENCE', `forbidden inference ${needed} is not marked forbidden`))
  }

  const deriv = data.derivation_rules || {}
  for (const key of FORBIDDEN_DERIVATIONS) {
    if (deriv[key] !== 'FORBIDDEN') errors.push(err('DERIVATION_RULE', `derivation rule ${key} must be FORBIDDEN`))
  }

  const ds = data.dataset || {}
  const nodesByKind = ds.nodes || {}
  const nodeIndex = new Map()
  for (const kind of NODE_KINDS) {
    const rows = Array.isArray(nodesByKind[kind]) ? nodesByKind[kind] : []
    if (!Array.isArray(nodesByKind[kind])) errors.push(has(nodesByKind[kind], `dataset.nodes.${kind} must be an array`))
    for (const [i, node] of rows.entries()) {
      const where = `nodes.${kind}[${i}]`
      if (!node || typeof node.id !== 'string' || !node.id) {
        errors.push(has(node && node.id, `${where}: node id missing`))
        continue
      }
      if (nodeIndex.has(node.id)) errors.push(err('DUPLICATE_ID', `${where}: duplicate node id ${node.id}`))
      nodeIndex.set(node.id, kind)
      if (node.kind && node.kind !== kind) errors.push(has(node.kind, `${where}: kind must equal ${kind}`))
      if (!STATUSES.includes(node.status)) errors.push(has(node.status, `${where}: invalid status`))
      if (node.from_heading_slot !== undefined && node.from_heading_slot !== null) {
        errors.push(err('HEADING_TO_VERSION', `${where}: heading slot ${node.from_heading_slot} was promoted to a ${kind} node`))
      }
      if (node.derived_from_heading !== undefined && node.derived_from_heading !== null) {
        errors.push(err('HEADING_TO_VERSION', `${where}: node derives from a heading label`))
      }
      const ev = Array.isArray(node.evidence) ? node.evidence : []
      if (ev.length === 0) errors.push(err('EVIDENCE_REF_MISSING', `${where}: node has no evidence locator`))
      for (const src of ev) {
        if (checkLocator(read, src, where, errors)) stats.quotes += 1
      }
    }
    stats.nodes += rows.length
  }

  const rowGroups = ds.label_rows || {}
  const labelIds = new Set()
  for (const cls of LABEL_CLASSES) {
    const rows = Array.isArray(rowGroups[cls]) ? rowGroups[cls] : []
    if (!Array.isArray(rowGroups[cls])) errors.push(has(rowGroups[cls], `dataset.label_rows.${cls} must be an array`))
    stats.labelRows[cls] = rows.length
    for (const [i, row] of rows.entries()) {
      const where = `label_rows.${cls}[${i}]`
      if (!row || typeof row.id !== 'string' || !row.id) {
        errors.push(has(row && row.id, `${where}: row id missing`))
        continue
      }
      if (labelIds.has(row.id) || nodeIndex.has(row.id)) errors.push(err('DUPLICATE_ID', `${where}: duplicate id ${row.id}`))
      labelIds.add(row.id)
      if (!STATUSES.includes(row.status)) errors.push(has(row.status, `${where}: invalid status`))
      if (row.node_id !== null && row.node_id !== undefined) {
        if (cls === 'heading_label') errors.push(err('HEADING_NODE', `${where}: heading label must not reference a node`))
        else if (!nodeIndex.has(row.node_id)) errors.push(err('PHANTOM_REFERENT', `${where}: node_id ${row.node_id} does not resolve`))
      }
      if (checkLocator(read, row.source, where, errors)) stats.quotes += 1
    }
  }

  const heads = rowGroups.heading_label || []
  if (heads.length !== 99) errors.push(err('HEADING_COUNT', `heading label rows must be 99 (got ${heads.length})`))
  const slots = heads.map((r) => r && r.slot)
  const slotSet = new Set(slots)
  if (slotSet.size !== heads.length) errors.push(err('HEADING_SLOTS', 'heading slots must be unique'))
  if (slots.some((s) => !Number.isInteger(s) || s < 1 || s > 99)) errors.push(err('HEADING_SLOTS', 'heading slots must be integers 1..99'))
  if (slotSet.size === 99 && slots.some((s) => !slotSet.has(s))) errors.push(err('HEADING_SLOTS', 'heading slots must be contiguous'))
  if (heads.some((r) => r && r.status !== 'LABEL_ONLY')) errors.push(err('HEADING_STATUS', 'every heading label is LABEL_ONLY'))

  const patches = rowGroups.patch_title_label || []
  if (patches.length !== 33) errors.push(err('PATCH_COUNT', `patch title rows must be 33 (got ${patches.length})`))
  if (new Set(patches.map((r) => r && r.slot)).size !== patches.length) errors.push(err('PATCH_SLOTS', 'patch slots must be unique'))
  if (patches.some((r) => r && r.completed !== false)) errors.push(err('PATCH_COMPLETED', 'no patch title may be marked completed'))
  const disputed = patches.filter((r) => r && r.disputed === true).map((r) => r.slot)
  if (disputed.length !== 1 || disputed[0] !== '014') errors.push(err('PATCH_DISPUTE', 'exactly patch 014 must stay disputed'))

  const episodes = rowGroups.episode_label || []
  if (episodes.length !== 3) errors.push(err('EPISODE_LABEL_COUNT', `episode label rows must be 3 (got ${episodes.length})`))
  if (episodes.some((r) => r && r.node_id !== null)) errors.push(err('PHANTOM_REFERENT', 'episode labels must not instantiate episode nodes'))

  const versions = rowGroups.version_family_ref || []
  if (versions.length !== 8) errors.push(err('VERSION_REF_COUNT', `version family refs must be 8 (got ${versions.length})`))
  if (versions.some((r) => r && r.artifact_in_repo !== false)) errors.push(err('PHANTOM_REFERENT', 'no version family ref may claim an in-repo artifact'))
  if (versions.some((r) => r && r.node_id !== null)) errors.push(err('PHANTOM_REFERENT', 'version family refs must not instantiate manuscript versions'))

  const edgesData = Array.isArray(ds.edges) ? ds.edges : []
  const edgeTypeById = new Map(edges.map((e) => [e && e.id, e]))
  const incoming = new Map()
  const outgoing = new Map()
  const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1)
  for (const [i, edge] of edgesData.entries()) {
    const where = `dataset.edges[${i}]`
    if (!edge || typeof edge.id !== 'string') {
      errors.push(has(edge && edge.id, `${where}: edge id missing`))
      continue
    }
    const type = edgeTypeById.get(edge.type)
    if (!type) {
      errors.push(err('EDGE_KIND', `${where}: unknown edge type ${edge.type}`))
      continue
    }
    const fromKind = nodeIndex.get(edge.from)
    const toKind = nodeIndex.get(edge.to)
    if (!fromKind || !toKind) {
      errors.push(err('DANGLING_EDGE', `${where}: ${edge.from} -> ${edge.to} does not resolve to existing nodes`))
      continue
    }
    const allowedTo = Array.isArray(type.to) ? type.to : [type.to]
    if (fromKind !== type.from || !allowedTo.includes(toKind)) {
      errors.push(err('EDGE_KIND', `${where}: ${fromKind} -> ${toKind} is not allowed for ${type.id}`))
    }
    bump(incoming, edge.to)
    bump(outgoing, edge.from)
  }
  stats.edges = edgesData.length
  for (const id of labelIds) {
    if (edgesData.some((e) => e && (e.from === id || e.to === id))) {
      errors.push(err('LABEL_ENDPOINT', `label row ${id} is used as an edge endpoint`))
    }
  }

  const versionTarget = new Map()
  for (const edge of edgesData) {
    if (edge && edge.type === 'version_of') versionTarget.set(edge.from, edge.to)
  }
  for (const [id, kind] of nodeIndex) {
    if (kind === 'world') {
      if ((incoming.get(id) || 0) > 0) errors.push(err('VERSION_PARENT', `root world ${id} must not have a parent`))
    } else if (kind === 'arc') {
      if ((incoming.get(id) || 0) !== 1) errors.push(err('VERSION_PARENT', `arc ${id} needs exactly one world parent`))
    } else if (kind === 'episode') {
      if ((incoming.get(id) || 0) !== 1) errors.push(err('VERSION_PARENT', `episode ${id} needs exactly one arc parent`))
    } else if (kind === 'scene') {
      if ((incoming.get(id) || 0) !== 1) errors.push(err('VERSION_PARENT', `scene ${id} needs exactly one episode parent`))
    } else if (kind === 'manuscript_version') {
      if ((incoming.get(id) || 0) !== 1) errors.push(err('VERSION_PARENT', `manuscript_version ${id} needs exactly one version_of parent`))
      if (!versionTarget.has(id)) errors.push(err('VERSION_PARENT', `manuscript_version ${id} has no version_of target`))
    }
  }

  const derived = new Map()
  for (const edge of edgesData) {
    if (edge && edge.type === 'version_derived_from') {
      if (!derived.has(edge.from)) derived.set(edge.from, [])
      derived.get(edge.from).push(edge.to)
      if (versionTarget.has(edge.from) && versionTarget.has(edge.to) && versionTarget.get(edge.from) !== versionTarget.get(edge.to)) {
        errors.push(err('VERSION_LINEAGE', `derived_from crosses version_of targets: ${edge.from} -> ${edge.to}`))
      }
    }
  }
  const state = new Map()
  const walk = (id) => {
    state.set(id, 1)
    for (const next of derived.get(id) || []) {
      if (state.get(next) === 1) {
        errors.push(err('VERSION_LINEAGE', `derived_from cycle at ${next}`))
        return
      }
      if (!state.has(next)) walk(next)
    }
    state.set(id, 2)
  }
  for (const id of derived.keys()) if (!state.has(id)) walk(id)

  const t = data.tallies || {}
  const decl = (cond, message) => {
    if (!cond) errors.push(err('TALLY_MISMATCH', message))
  }
  const nodeCounts = Object.fromEntries(NODE_KINDS.map((k) => [k, (nodesByKind[k] || []).length]))
  const totalNodes = Object.values(nodeCounts).reduce((a, b) => a + b, 0)
  decl(t.nodes_total === totalNodes, `nodes_total ${t.nodes_total} != ${totalNodes}`)
  decl(JSON.stringify(t.nodes_by_kind) === JSON.stringify(nodeCounts), `nodes_by_kind ${JSON.stringify(t.nodes_by_kind)} != ${JSON.stringify(nodeCounts)}`)
  decl(t.edges_total === edgesData.length, `edges_total ${t.edges_total} != ${edgesData.length}`)
  decl(JSON.stringify(t.label_rows) === JSON.stringify(stats.labelRows), `label_rows ${JSON.stringify(t.label_rows)} != ${JSON.stringify(stats.labelRows)}`)
  const totalLabels = Object.values(stats.labelRows).reduce((a, b) => a + b, 0)
  decl(t.label_rows_total === totalLabels, `label_rows_total ${t.label_rows_total} != ${totalLabels}`)
  decl(t.doc_evidence_rows === evidence.length, `doc_evidence_rows ${t.doc_evidence_rows} != ${evidence.length}`)
  decl(t.source_quotes_total === stats.quotes, `source_quotes_total ${t.source_quotes_total} != ${stats.quotes}`)
  decl(t.originals_claimed === 0, 'originals_claimed must be 0')
  decl(t.node_instances_with_artifact === 0, 'node_instances_with_artifact must be 0')

  const proof = data.acceptance_proof || {}
  const versionNodes = (nodesByKind.manuscript_version || []).length
  decl(proof.heading_rows === heads.length, `acceptance heading_rows ${proof.heading_rows} != ${heads.length}`)
  decl(proof.manuscript_version_nodes === versionNodes, `acceptance manuscript_version_nodes ${proof.manuscript_version_nodes} != ${versionNodes}`)
  decl(proof.originals_claimed === 0, 'acceptance originals_claimed must be 0')
  decl(proof.edges_from_heading_labels === 0, 'acceptance edges_from_heading_labels must be 0')
  decl(proof.label_classes_are_nodes === 0, 'acceptance label_classes_are_nodes must be 0')
  decl(heads.length === 99 && versionNodes === 0, '99 headings must resolve to 0 manuscript versions')

  if (typeof designText !== 'string' || !designText.includes('99 chapter headings') || !designText.includes('not 99 originals')) {
    errors.push(err('DESIGN_MISSING', 'design document must state the acceptance sentence'))
  } else {
    for (const item of evidence) {
      const needleId = `**${item.id}**`
      const needleLoc = `${item.file}:${item.line}`
      const ok = designText.split(/\r?\n/).some((line) => line.includes(needleId) && line.includes(needleLoc) && line.includes(item.quote))
      if (!ok) errors.push(err('DESIGN_DRIFT', `design document does not mirror ${item.id} ${needleLoc} with its verbatim quote`))
    }
    for (const id of [...REQUIRED_INVARIANTS, ...REQUIRED_INFERENCES, ...REQUIRED_RULES]) {
      if (!designText.includes(id)) errors.push(err('DESIGN_MISSING_ID', `design document does not name ${id}`))
    }
  }

  return { errors, stats }
}

function summarize(stats) {
  return [
    `PASS ontology node kinds=${NODE_KINDS.length} label classes=${LABEL_CLASSES.length} edges=${REQUIRED_EDGES.length} cardinality rules=${REQUIRED_RULES.length} invariants=${REQUIRED_INVARIANTS.length} forbidden inferences=${REQUIRED_INFERENCES.length}`,
    `PASS ${stats.quotes} source quotes resolved at their cited file:line (${stats.docEvidence} document + ${Object.values(stats.labelRows).reduce((a, b) => a + b, 0)} label rows)`,
    `PASS dataset nodes=${stats.nodes} edges=${stats.edges} heading=${stats.labelRows.heading_label} patch=${stats.labelRows.patch_title_label} episode=${stats.labelRows.episode_label} version_ref=${stats.labelRows.version_family_ref}`,
    'PASS acceptance heading labels=99 manuscript_version nodes=0 originals_claimed=0 edges from headings=0',
    'PASS declared tallies match enumerated rows; heading slots 1-99 unique; patch 014 stays disputed',
    'PASS design document mirrors every evidence id, locator and verbatim quote; no other-session file is read',
    'NOTE zero story nodes instantiated, zero originals claimed, zero source text reproduced',
  ].join('\n')
}

function load() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  const designText = fs.readFileSync(DESIGN_FILE, 'utf8')
  return { data, designText, read: makeReader(ROOT) }
}

function runPositive() {
  const { data, designText, read } = load()
  const { errors, stats } = lint(data, { read, designText })
  if (errors.length) {
    console.log('FAIL valid dataset rejected')
    for (const e of errors) console.log(`  ${e.code}: ${e.message}`)
    console.log('exit=1')
    return 1
  }
  console.log(summarize(stats))
  console.log('exit=0')
  return 0
}

function runSelfTest() {
  const { data, designText, read } = load()
  const base = JSON.parse(JSON.stringify(data))
  const valid = lint(base, { read, designText })
  const failures = []
  if (valid.errors.length) {
    failures.push('valid fixture was rejected: ' + valid.errors.map((e) => e.code).join(','))
  } else {
    console.log('PASS  positive: valid fixture accepted with 0 errors')
  }

  const cases = []
  const add = (name, mutate, expected) => cases.push({ name, mutate, expected })

  add('quote drift is rejected (heading 01)', (d) => {
    d.dataset.label_rows.heading_label[0].source.quote = '01 The Unrecorded Beginning (tampered)'
  }, 'QUOTE_MISMATCH')

  add('tally drift is rejected (heading tally 98)', (d) => {
    d.tallies.label_rows.heading_label = 98
  }, 'TALLY_MISMATCH')

  add('99 headings treated as 99 originals is rejected', (d) => {
    const rows = d.dataset.label_rows.heading_label.slice(0, 99)
    d.dataset.nodes.manuscript_version = rows.map((r) => ({
      id: 'mv_' + String(r.slot).padStart(2, '0'),
      kind: 'manuscript_version',
      status: 'EVIDENCED',
      from_heading_slot: r.slot,
      evidence: [{ file: r.source.file, line: r.source.line, quote: r.source.quote }],
    }))
    d.tallies.nodes_by_kind.manuscript_version = 99
    d.tallies.nodes_total = 99
    d.tallies.node_instances_with_artifact = 0
    d.acceptance_proof.manuscript_version_nodes = 99
  }, 'HEADING_TO_VERSION')

  add('dangling edge is rejected', (d) => {
    d.dataset.edges.push({ id: 'e_world_arc', type: 'world_contains_arc', from: 'sw_missing_world', to: 'arc_missing' })
    d.tallies.edges_total = 1
  }, 'DANGLING_EDGE')

  add('missing required invariant is rejected', (d) => {
    d.invariants = d.invariants.filter((r) => r.id !== 'INV-HEADING-NOT-ORIGINAL')
  }, 'MISSING_INVARIANT')

  add('scene without an episode (version) parent is rejected', (d) => {
    d.dataset.nodes.scene = [{
      id: 'sc_orphan',
      kind: 'scene',
      status: 'LABEL_ONLY',
      evidence: [{ file: 'docs/vision/MASTER_VISION_NARRATIVE_XV.md', line: 973, quote: 'exact NPD page/scene/media order remain incompletely recovered' }],
    }]
    d.tallies.nodes_by_kind.scene = 1
    d.tallies.nodes_total = 1
  }, 'VERSION_PARENT')

  add('heading label promoted to a node kind is rejected', (d) => {
    d.node_kinds.push({ id: 'heading_label', is_node: true, domain_owner: 'D07', parent_kinds: [], evidence_refs: ['E10'] })
  }, 'NODE_KIND_SET')

  add('patch completed flag is rejected', (d) => {
    d.dataset.label_rows.patch_title_label[0].completed = true
  }, 'PATCH_COMPLETED')

  add('duplicate heading slot is rejected', (d) => {
    d.dataset.label_rows.heading_label[1].slot = 1
  }, 'HEADING_SLOTS')

  add('heading row pointing at a node is rejected', (d) => {
    d.dataset.label_rows.heading_label[0].node_id = 'mv_01'
  }, 'HEADING_NODE')

  add('patch slot 014 dispute removal is rejected', (d) => {
    d.dataset.label_rows.patch_title_label[13].disputed = false
  }, 'PATCH_DISPUTE')

  add('derivation rule weakening is rejected', (d) => {
    d.derivation_rules.heading_count_to_original_count = 'ALLOWED'
  }, 'DERIVATION_RULE')

  add('missing version_of edge type is rejected', (d) => {
    d.edge_types = d.edge_types.filter((e) => e.id !== 'version_of')
  }, 'EDGE_MISSING')

  add('out-of-range locator is rejected', (d) => {
    d.doc_evidence[0].line = 999999
  }, 'LOCATOR_RANGE')

  add('design-document drift is rejected', () => ({
    design: designText
      .split(/\r?\n/)
      .map((line) => (line.includes('**E01**') ? line.replace('| D07 | Story & Media | World, arc, character, episode, scene, poster/media manifest, editorial variants | SHADOW workspace consumes it |', '| D07 | Story & Media | tampered |') : line))
      .join('\n'),
  }), 'DESIGN_DRIFT')

  for (const test of cases) {
    const mutant = JSON.parse(JSON.stringify(base))
    const out = test.mutate(mutant)
    const useDesign = out && typeof out.design === 'string' ? out.design : designText
    const result = lint(mutant, { read, designText: useDesign })
    const codes = result.errors.map((e) => e.code)
    if (codes.includes(test.expected)) {
      console.log(`PASS  negative: ${test.name} (${test.expected})`)
    } else {
      failures.push(`${test.name}: expected ${test.expected}, got [${codes.join(',') || 'no errors'}]`)
    }
  }

  if (failures.length) {
    console.log('SELF-TEST FAIL')
    for (const f of failures) console.log('  ' + f)
    console.log('exit=1')
    return 1
  }
  console.log(`SELF-TEST PASS: valid fixture accepted; all ${cases.length} invalid datasets rejected`)
  console.log('exit=0')
  return 0
}

const selfTest = process.argv.includes('--self-test')
process.exitCode = selfTest ? runSelfTest() : runPositive()
