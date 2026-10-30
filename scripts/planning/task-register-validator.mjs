import path from 'node:path';

const TASK_ROW = /^\|\s*-\s*\[([ x])\]\s*\|\s*\*\*([^*]+)\*\*\s*[—-]\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/;
const TASK_ID = /^M\d{2}-\d{2}$/;
const TASK_DEPENDENCY = /^M\d{2}-\d{2}$/;
const MILESTONE_DEPENDENCY = /^M\d{2}$/;
const RANGE_DEPENDENCY = /^(M\d{2})-(\d{2})\.\.(\d{2})$/;

function diagnostic(code, file, line, message) {
  return { code, file, line, message };
}

function parseTaskRows(todoMarkdown, todoPath, errors) {
  const tasks = [];
  const seen = new Set();
  const lines = todoMarkdown.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = TASK_ROW.exec(lines[index]);
    if (!match) continue;
    const [, checked, rawId, title, , , rawDependencies] = match;
    const id = rawId.trim();
    if (!TASK_ID.test(id)) {
      errors.push(diagnostic('TASK_ID_INVALID', todoPath, index + 1, `Invalid task ID: ${id}`));
      continue;
    }
    if (seen.has(id)) errors.push(diagnostic('TASK_ID_DUPLICATE', todoPath, index + 1, `Duplicate task ID: ${id}`));
    seen.add(id);
    tasks.push({ id, checked: checked === 'x', title: title.trim(), rawDependencies: rawDependencies.trim(), line: index + 1 });
  }
  if (tasks.length === 0) errors.push(diagnostic('TASK_ROWS_MISSING', todoPath, 1, 'No TODO task rows were found.'));
  return tasks;
}

function expandDependency(token, taskIds, milestones) {
  const range = RANGE_DEPENDENCY.exec(token);
  if (range) {
    const [, milestone, fromText, toText] = range;
    const from = Number(fromText);
    const to = Number(toText);
    if (to < from) return { error: `Dependency range is reversed: ${token}` };
    const ids = Array.from({ length: to - from + 1 }, (_, offset) => `${milestone}-${String(from + offset).padStart(2, '0')}`);
    const missing = ids.filter(id => !taskIds.has(id));
    return missing.length ? { error: `Dependency range references missing task(s): ${missing.join(', ')}` } : { ids };
  }
  if (TASK_DEPENDENCY.test(token)) return taskIds.has(token) ? { ids: [token] } : { error: `Unknown task dependency: ${token}` };
  if (MILESTONE_DEPENDENCY.test(token)) return milestones.has(token) ? { ids: [...taskIds].filter(id => id.startsWith(`${token}-`)) } : { error: `Unknown milestone dependency: ${token}` };
  return { error: `Malformed dependency token: ${token}` };
}

function validateDependencies(tasks, errors, file) {
  const taskIds = new Set(tasks.map(task => task.id));
  const milestones = new Set(tasks.map(task => task.id.slice(0, 3)));
  const graph = new Map();
  for (const task of tasks) {
    const tokens = task.rawDependencies === '' || task.rawDependencies === '—' ? [] : task.rawDependencies.split(',').map(token => token.trim());
    const dependencies = [];
    for (const token of tokens) {
      const result = expandDependency(token, taskIds, milestones);
      if (result.error) errors.push(diagnostic('DEPENDENCY_INVALID', file, task.line, result.error));
      else dependencies.push(...result.ids);
    }
    if (dependencies.includes(task.id)) errors.push(diagnostic('DEPENDENCY_SELF', file, task.line, `Task depends on itself: ${task.id}`));
    graph.set(task.id, dependencies);
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id, stack) {
    if (visiting.has(id)) {
      const task = tasks.find(entry => entry.id === id);
      errors.push(diagnostic('DEPENDENCY_CYCLE', file, task?.line ?? 1, `Dependency cycle: ${[...stack, id].join(' -> ')}`));
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependency of graph.get(id) ?? []) visit(dependency, [...stack, id]);
    visiting.delete(id);
    visited.add(id);
  }
  for (const task of tasks) visit(task.id, []);
}

function headingSlugs(markdown) {
  const counts = new Map();
  const slugs = new Set();
  for (const line of markdown.split(/\r?\n/)) {
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) continue;
    const base = heading[2].toLowerCase().replace(/<[^>]*>/g, '').replace(/\s+[—–]\s+/g, '--').replace(/[—–]/g, '-').replace(/[^\p{L}\p{N}_ -]/gu, '').trim().replace(/\s+/g, '-');
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    slugs.add(count === 0 ? base : `${base}-${count}`);
  }
  return slugs;
}

function validateLinks(markdownFiles, root, errors) {
  const files = new Map(markdownFiles.map(file => [file.path.replaceAll('\\', '/').replace(/^\.\//, ''), file.content]));
  for (const file of markdownFiles) {
    if (typeof file.content !== 'string') continue;
    const source = file.path.replaceAll('\\', '/').replace(/^\.\//, '');
    const lines = file.content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const pattern = /!?\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+[^)]*)?\)/g;
      for (const match of lines[index].matchAll(pattern)) {
        let target = match[1].startsWith('<') ? match[1].slice(1, -1) : match[1];
        if (/^(https?:|mailto:|data:)/i.test(target) || target.startsWith('//')) continue;
        if (/^[a-z][a-z\d+.-]*:/i.test(target)) {
          errors.push(diagnostic('LINK_UNSAFE', source, index + 1, `Unsupported link scheme: ${target}`));
          continue;
        }
        const [pathAndQuery, rawFragment = ''] = target.split('#', 2);
        const encodedPath = pathAndQuery.split('?', 1)[0];
        let rawPath;
        let fragment;
        try {
          rawPath = decodeURIComponent(encodedPath);
          fragment = decodeURIComponent(rawFragment);
        } catch {
          errors.push(diagnostic('LINK_MALFORMED', source, index + 1, `Malformed percent-encoding: ${target}`));
          continue;
        }
        const relativeTarget = rawPath === '' ? source : rawPath.startsWith('/') ? rawPath.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(source), rawPath));
        const resolved = path.resolve(root, relativeTarget);
        const rootPath = path.resolve(root);
        if (resolved !== rootPath && !resolved.startsWith(`${rootPath}${path.sep}`)) {
          errors.push(diagnostic('LINK_UNSAFE', source, index + 1, `Local link escapes repository root: ${target}`));
          continue;
        }
        let targetPath = relativeTarget;
        let targetFound = files.has(targetPath);
        let targetContent = files.get(targetPath);
        if (!targetFound && (targetPath === '.' || targetPath.endsWith('/'))) {
          const directory = targetPath === '.' ? '' : targetPath.replace(/\/$/, '');
          for (const indexName of ['README.md', 'index.md']) {
            const candidate = [directory, indexName].filter(Boolean).join('/');
            if (files.has(candidate)) { targetPath = candidate; targetContent = files.get(candidate); targetFound = true; break; }
          }
        }
        if (!targetFound) {
          errors.push(diagnostic('LINK_MISSING', source, index + 1, `Missing local Markdown target: ${target}`));
          continue;
        }
        if (fragment && typeof targetContent === 'string') {
          const normalizedFragment = fragment.toLowerCase();
          if (!headingSlugs(targetContent).has(normalizedFragment)) errors.push(diagnostic('LINK_FRAGMENT_MISSING', source, index + 1, `Missing heading fragment #${fragment} in ${targetPath}`));
        }
      }
    }
  }
}

function computeAggregates(tasks) {
  const milestones = new Set();
  let checked = 0;
  let unchecked = 0;
  for (const task of tasks) {
    milestones.add(task.id.slice(0, task.id.indexOf('-')));
    if (task.checked) checked += 1;
    else unchecked += 1;
  }
  return {
    total: tasks.length,
    checked,
    unchecked,
    milestones: [...milestones].sort(),
    milestoneCount: milestones.size,
  };
}

function validateAggregates(aggregates, allowlist, errors, file) {
  if (!allowlist) return;
  const checks = [
    ['total', aggregates.total],
    ['checked', aggregates.checked],
    ['unchecked', aggregates.unchecked],
    ['milestoneCount', aggregates.milestoneCount],
  ];
  for (const [key, actual] of checks) {
    if (key in allowlist && allowlist[key] !== actual) {
      errors.push(diagnostic('AGGREGATE_MISMATCH', file, 1, `${key}: expected ${allowlist[key]}, got ${actual}`));
    }
  }
  if (allowlist.milestones) {
    const expected = [...allowlist.milestones].sort();
    const actual = aggregates.milestones;
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      errors.push(diagnostic('AGGREGATE_MISMATCH', file, 1, `milestones: expected ${expected.join(',')}, got ${actual.join(',')}`));
    }
  }
}

/**
 * Read-only validator contract: task IDs are `Mdd-dd`; dependencies accept task IDs,
 * milestone IDs, and same-milestone `Mdd-dd..dd` ranges. Supplied inline Markdown
 * links must resolve inside root; anchors are checked against GitHub-style heading
 * slugs when the target content is available. External http(s)/mailto/data URLs pass.
 * Aggregate allowlist compares derived totals (total/checked/unchecked/milestones)
 * with explicit expectations. Diagnostics carry code, source path, line and
 * explanation; the function never writes.
 */
export function validateTaskRegister({ todoMarkdown, todoPath = 'TODO.md', markdownFiles = [], root = process.cwd(), aggregateAllowlist = null }) {
  const errors = [];
  const tasks = parseTaskRows(todoMarkdown, todoPath, errors);
  validateDependencies(tasks, errors, todoPath);
  validateLinks(markdownFiles, root, errors);
  const aggregates = computeAggregates(tasks);
  validateAggregates(aggregates, aggregateAllowlist, errors, todoPath);
  return { ok: errors.length === 0, taskCount: tasks.length, aggregates, errors };
}
