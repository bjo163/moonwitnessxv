import test from 'node:test';
import assert from 'node:assert/strict';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const SCRIPT = resolve(process.cwd(), 'scripts', 'check-ui-consistency.mjs');

function fixtureRoot() {
  return mkdtempSync(join(tmpdir(), 'moonui-gate-'));
}

function writeFile(root, relativePath, body) {
  const full = join(root, relativePath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body, 'utf8');
}

function writeLedger(root, entries) {
  writeFile(
    root,
    'docs/design/moonui-exceptions.json',
    JSON.stringify({ version: 1, generatedAt: '2026-10-30', note: 'fixture', entries }, null, 2),
  );
}

/** Runs the gate against a fixture tree and returns { status, report }. */
function runGate(root) {
  const jsonPath = join(root, 'ui-consistency.json');
  let status = 0;
  try {
    execFileSync(process.execPath, [SCRIPT, '--root', root, `--json=${jsonPath}`], { stdio: 'pipe' });
  } catch (error) {
    status = typeof error.status === 'number' ? error.status : 1;
  }
  const report = JSON.parse(readFileSync(jsonPath, 'utf8'));
  return { status, report };
}

const CLEAN_COMPONENT = `import { Button } from '@moonwitness/moonui'

export function DemoPanel() {
  return <div><Button>open</Button></div>
}
`;

const FORK_COMPONENT = `import { IconMoon } from '@moonwitness/moonui'

export function Chip({ label }: { label: string }) {
  return <button className="demo-chip">{label}<IconMoon /></button>
}
`;

test('gate passes on a tree whose only component consumes MoonUI and is ledgered', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'apps/demo/src/components/DemoPanel.tsx', CLEAN_COMPONENT);
  writeLedger(root, [
    {
      path: 'apps/demo/src/components/DemoPanel.tsx',
      owner: 'demo',
      mode: 'view',
      exports: ['DemoPanel'],
      reason: 'fixture debt',
      removalTask: 'M19-36',
    },
  ]);

  const { status, report } = runGate(root);
  assert.equal(status, 0, JSON.stringify(report.violations, null, 2));
  assert.equal(report.ok, true);
  assert.equal(report.violations.length, 0);
});

test('gate rejects an icons-only component that declares a MoonUI-owned primitive', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'apps/demo/src/components/ChipFork.tsx', FORK_COMPONENT);
  writeFile(root, 'apps/other/src/components/ChipFork.tsx', FORK_COMPONENT);
  writeLedger(root, []);

  const { status, report } = runGate(root);
  assert.equal(status, 1);
  const checks = new Set(report.violations.map((violation) => violation.check));
  assert.ok(checks.has('C1'), 'icons-only import must fail C1');
  assert.ok(checks.has('C5'), 'a MoonUI-owned name declared locally must fail C5');
  assert.ok(checks.has('C6'), 'an unregistered component file must fail C6');
  const duplicate = report.matrix.find((row) => row.name === 'Chip');
  assert.ok(duplicate, 'Chip must appear in the promotion matrix');
  assert.deepEqual(duplicate.apps.sort(), ['demo', 'other']);
});

test('gate rejects a component-level class in an app stylesheet', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'apps/demo/src/app/globals.css', '.demo-btn { color: var(--fg); }\n');
  writeLedger(root, []);

  const { status, report } = runGate(root);
  assert.equal(status, 1);
  const c3 = report.violations.filter((violation) => violation.check === 'C3');
  assert.equal(c3.length, 1);
  assert.match(c3[0].message, /demo-btn/);
});

test('a BEM spelling of a component class is the same violation', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  // The Empire stylesheet spells its primitives with `__`; a suffix match on `-`
  // alone let exactly these classes through while `ui:check` reported zero debt.
  writeFile(
    root,
    'apps/demo/src/app/globals.css',
    '.demo__btn { color: var(--fg); }\n.su-lib__tab { display: flex; }\n.su-info__card { border: 1px solid var(--rule); }\n',
  );
  writeLedger(root, []);

  const { status, report } = runGate(root);
  assert.equal(status, 1);
  const flagged = new Set(
    report.violations.filter((violation) => violation.check === 'C3').map((violation) => violation.message),
  );
  for (const selector of ['.demo__btn', '.su-lib__tab', '.su-info__card']) {
    assert.ok([...flagged].some((message) => message.includes(selector)), `${selector} must fail C3`);
  }
});

test('the gate measures CSS that only an app stylesheet defines for a MoonUI class', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(
    root,
    'packages/moonui/src/surfaces/demo.tsx',
    `import type { ReactNode } from 'react'\n\nexport function DemoChrome(): ReactNode {\n  return <footer className="demo-footer demo-footer__nav">x</footer>\n}\n`,
  );
  writeFile(
    root,
    'apps/demo/src/app/globals.css',
    '.demo-footer { display: flex; }\n.demo-footer__nav { gap: 8px; }\n',
  );
  writeLedger(root, []);

  const { report } = runGate(root);
  const debt = new Map(report.cssDebt.entries.map((entry) => [entry.cls, entry]))
  assert.ok(debt.get('demo-footer'), 'a MoonUI class styled only by an app stylesheet is measured')
  assert.deepEqual(debt.get('demo-footer')?.definedIn, ['apps/demo/src/app/globals.css'])
  assert.deepEqual(debt.get('demo-footer')?.emittedIn, ['packages/moonui/src/surfaces/demo.tsx'])
});

test('the design-system CSS ratchet fails when the orphan list grows past its ceiling', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  const classes = Array.from({ length: reportCeiling() + 1 }, (_unused, index) => `orphan-${index}`)
  writeFile(
    root,
    'packages/moonui/src/surfaces/demo.tsx',
    `export function DemoChrome() {
  return <div>${classes.map((cls) => `<span className="${cls}" />`).join('')}</div>
}
`,
  )
  writeFile(root, 'apps/demo/src/app/globals.css', classes.map((cls) => `.${cls} { color: red; }`).join('\n'))
  writeLedger(root, [])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const ceiling = report.violations.find((violation) => violation.check === 'C7')
  assert.ok(ceiling, 'more orphans than the ceiling must fail C7')
  assert.equal(report.cssDebt.entries.length, classes.length)
})

test('a renamed twin of a MoonUI view is caught by its markup fingerprint', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  const twinClasses = Array.from({ length: 12 }, (_unused, index) => `twin-${index}`)
  writeFile(root, 'packages/moonui/moon.css', twinClasses.map((cls) => `.${cls} { color: red; }`).join('\n'))
  const markup = `<div>${twinClasses.map((cls) => `<span className="${cls}" />`).join('')}</div>`
  writeFile(
    root,
    'packages/moonui/src/surfaces/demo.tsx',
    `export function DemoView() {
  return ${markup}
}
`,
  )
  // Same anatomy, different component name: C5 cannot see this pair.
  writeFile(
    root,
    'apps/demo/src/components/RenewedDemoView.tsx',
    `import { Button } from '@moonwitness/moonui'

export function RenewedDemoView() {
  return <Button>${markup}</Button>
}
`,
  )
  writeLedger(root, [])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const fork = report.violations.find((violation) => violation.check === 'C8')
  assert.ok(fork, 'an app file rendering a MoonUI view class-for-class must fail C8')
  assert.match(fork.file, /RenewedDemoView\.tsx$/)
  assert.match(fork.message, /packages\/moonui\/src\/surfaces\/demo\.tsx/)
})

test('a page that merely composes shared primitives is not mistaken for a fork', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  const anatomy = Array.from({ length: 12 }, (_unused, index) => `panel-${index}`)
  writeFile(root, 'packages/moonui/moon.css', anatomy.map((cls) => `.${cls} { color: red; }`).join('\n'))
  writeFile(
    root,
    'packages/moonui/src/surfaces/demo.tsx',
    `export function DemoView() {
  return <div>${anatomy.map((cls) => `<span className="${cls}" />`).join('')}</div>
}
`,
  )
  // The page uses some of the same primitives but is not a copy of the view.
  writeFile(
    root,
    'apps/demo/src/components/DemoPageBits.tsx',
    `import { Button } from '@moonwitness/moonui'

export function DemoPageBits() {
  return <Button>${anatomy.slice(0, 5).map((cls) => `<span className="${cls}" />`).join('')}</Button>
}
`,
  )
  writeLedger(root, [{ path: 'apps/demo/src/components/DemoPageBits.tsx', owner: 'demo', mode: 'view', exports: ['DemoPageBits'], reason: 'fixture', removalTask: 'M19-36' }])

  const { report } = runGate(root)
  assert.deepEqual(
    report.violations.filter((violation) => violation.check === 'C8'),
    [],
    'partial overlap with a shared anatomy is composition, not a fork',
  )
})

/** The ceiling the script enforces, read from its own source. */
function reportCeiling() {
  const source = readFileSync(SCRIPT, 'utf8')
  const value = /MOONUI_CSS_DEBT_CEILING = (\d+)/.exec(source)?.[1]
  assert.ok(value, 'the C7 ceiling must be a constant in the linter source')
  return Number(value)
}

test('a drifted hex colour in app source or an app stylesheet is reported', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(
    root,
    'apps/demo/src/components/DemoPanel.tsx',
    `import { Button } from '@moonwitness/moonui'

export function DemoPanel() {
  return <div style={{ color: '#00e5ff' }}><Button>open</Button></div>
}
`,
  )
  writeFile(root, 'apps/demo/src/app/globals.css', '.demo-band { background: #22d3ee; }\n')
  writeLedger(root, [
    {
      path: 'apps/demo/src/components/DemoPanel.tsx',
      owner: 'demo',
      mode: 'view',
      exports: ['DemoPanel'],
      reason: 'fixture debt',
      removalTask: 'M19-36',
    },
  ])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const colours = report.violations.filter((violation) => violation.check === 'C2')
  assert.equal(colours.length, 2, 'the component style and the stylesheet rule are both token drift')
  assert.ok(colours.every((violation) => /drifted hex colour/.test(violation.message)))
  assert.ok(colours.some((violation) => /var\(--cyan\)/.test(violation.remedy ?? '')), 'the remedy names the token to use')
})

test('an untokenized font stack in an app stylesheet is reported', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'apps/demo/src/app/globals.css', '.demo-band { font-family: Arial, sans-serif; }\n')
  writeLedger(root, [])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const type = report.violations.filter((violation) => violation.check === 'C4')
  assert.equal(type.length, 1)
  assert.match(type[0].message, /untokenized font stack/)

  // The token form is accepted, so the check cannot be satisfied only by deleting CSS.
  writeFile(root, 'apps/demo/src/app/globals.css', '.demo-band { font-family: var(--font-display); }\n')
  const second = runGate(root)
  assert.deepEqual(second.report.violations.filter((violation) => violation.check === 'C4'), [])
})

test('a ledger that names a declaration which no longer exists is rejected', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'apps/demo/src/components/DemoPanel.tsx', CLEAN_COMPONENT)
  writeLedger(root, [
    {
      path: 'apps/demo/src/components/DemoPanel.tsx',
      owner: 'demo',
      mode: 'view',
      exports: ['DemoPanel', 'RenamedAway'],
      selectors: ['.demo-no-longer-here'],
      reason: 'fixture debt',
      removalTask: 'M19-36',
    },
  ])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const stale = report.violations.filter((violation) => violation.check === 'C6')
  assert.equal(stale.length, 2, 'both the missing export and the missing selector exemption are stale debt')
  assert.ok(stale.some((violation) => /RenamedAway/.test(violation.message)))
  assert.ok(stale.some((violation) => /demo-no-longer-here/.test(violation.message)))
})

test('a MoonUI class name assembled from data is rejected, a caller class is not', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'packages/moonui/moon.css', '.demo-box { color: red; }\n')
  writeFile(
    root,
    'packages/moonui/src/derived.tsx',
    `export function Derived({ variant, className }) {
  return <div className={\`demo-box demo-\${variant}\`} />
}
`,
  )
  writeLedger(root, [])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const derived = report.violations.filter((violation) => violation.check === 'C9')
  assert.equal(derived.length, 1, 'a concatenated class fragment must fail C9')
  assert.match(derived[0].file, /packages\/moonui\/src\/derived\.tsx$/)

  // Substituting a whole caller-supplied class is the sanctioned composition.
  writeFile(
    root,
    'packages/moonui/src/derived.tsx',
    `export function Derived({ className }) {
  return <div className={\`demo-box \${className ?? ''}\`} />
}
`,
  )
  const second = runGate(root)
  assert.deepEqual(
    second.report.violations.filter((violation) => violation.check === 'C9'),
    [],
    'a caller class substitution is not a derived anatomy name',
  )
})

test('an app stylesheet may place a primitive but not redraw it', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'packages/moonui/moon.css', '.m-btn { color: red; }\n.m-badge { color: red; }\n')
  writeFile(
    root,
    'apps/demo/src/app/globals.css',
    '.dk-map-pin .m-badge { max-width: 90px; }\n.dk-panel .m-btn { border-bottom: 3px dotted red; }\n',
  )
  writeLedger(root, [])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const overrides = report.violations.filter((violation) => violation.check === 'C10')
  assert.equal(overrides.length, 1, 'a positional rule is band layout; a border redraws the primitive')
  assert.match(overrides[0].message, /m-btn/)
  assert.match(overrides[0].message, /border-bottom/)
})

test('a band class stacked on a primitive may not repaint it', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'packages/moonui/moon.css', '.m-live-dot { width: 8px; height: 8px; background: red; }\n')
  writeFile(
    root,
    'packages/moonui/src/data.tsx',
    'export function LiveDot() {\n  return <span className="demo-state-dot m-live-dot" />\n}\n',
  )
  writeFile(
    root,
    'apps/demo/src/app/globals.css',
    '.demo-state-dot { width: 7px; background: grey; margin-right: 8px; }\n',
  )
  writeLedger(root, [])

  const { status, report } = runGate(root)
  assert.equal(status, 1)
  const repaints = report.violations.filter((violation) => violation.check === 'C10')
  assert.equal(repaints.length, 1, 'the selector never names .m-live-dot, the element does')
  assert.match(repaints[0].message, /demo-state-dot \(on the same element as \.m-live-dot\)/)
  assert.match(repaints[0].message, /background/)
  assert.doesNotMatch(repaints[0].message, /margin-right/, 'placing the dot is legal; resizing and recolouring it is not')
})

test('gate rejects a ledger that grows past the ratchet', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'apps/demo/src/components/DemoPanel.tsx', CLEAN_COMPONENT);
  const entries = Array.from({ length: 200 }, () => ({
    path: 'apps/demo/src/components/DemoPanel.tsx',
    owner: 'demo',
    mode: 'view',
    exports: ['DemoPanel'],
    reason: 'fixture debt',
    removalTask: 'M19-36',
  }));
  writeLedger(root, entries);

  const { status, report } = runGate(root);
  assert.equal(status, 1);
  const ceiling = report.violations.find(
    (violation) => violation.check === 'C6' && /ceiling/.test(violation.message),
  );
  assert.ok(ceiling, 'an over-cap ledger must fail C6');
  assert.ok(report.ratchet < 200);
});

test('gate rejects a component file that is missing from the ledger', () => {
  const root = fixtureRoot();
  writeFile(root, 'packages/moonui/src/index.ts', "export { Button } from './x.js'\n");
  writeFile(root, 'apps/demo/src/components/DemoPanel.tsx', CLEAN_COMPONENT);
  writeLedger(root, []);

  const { status, report } = runGate(root);
  assert.equal(status, 1);
  const unregistered = report.violations.find(
    (violation) => violation.check === 'C6' && /not registered/.test(violation.message),
  );
  assert.ok(unregistered, 'an unregistered component file must fail C6');
});
