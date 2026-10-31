import test from 'node:test';
import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { moonwitnessPlugin } from '@moonwitness/eslint-config';

const linter = new Linter();

function verify(code, filename, options = {}) {
  return linter.verify(code, {
    files: ['**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@moonwitness': moonwitnessPlugin },
    rules: {
      '@moonwitness/shared-ui-only': [
        'error',
        {
          names: ['Chip', 'Modal', 'Stat'],
          exceptions: ['apps/demo/src/components/Ledgered.tsx'],
          ignoreBasenames: ['page.tsx', 'layout.tsx'],
          ...options,
        },
      ],
    },
  }, filename);
}

test('raw interactive markup in an app component is reported as an import boundary violation', () => {
  const messages = verify(
    `export function Toolbar() {\n  return <button className="demo-btn">go</button>\n}\n`,
    'apps/demo/src/components/Toolbar.tsx',
  );
  assert.equal(messages.length, 1);
  assert.equal(messages[0].messageId, 'importBoundary');
  assert.match(messages[0].message, /Button or LinkButton/);
});

test('an app component that redeclares a MoonUI-owned name is reported', () => {
  const messages = verify(
    `export function Chip({ label }: { label: string }) {\n  return <span>{label}</span>\n}\n`,
    'apps/demo/src/components/Fork.tsx',
  );
  assert.equal(messages.length, 1);
  assert.equal(messages[0].messageId, 'localPrimitive');
  assert.match(messages[0].message, /'Chip' is owned by @moonwitness\/moonui/);
});

test('a const-declared primitive fork is reported too', () => {
  const messages = verify(
    `export const Modal = ({ children }: { children: unknown }) => <div>{children as never}</div>\n`,
    'apps/demo/src/components/Fork.tsx',
  );
  assert.equal(messages.length, 1);
  assert.equal(messages[0].messageId, 'localPrimitive');
});

test('ledgered files and route shells stay exempt until they are migrated', () => {
  const body = `export function Chip() {\n  return <button className="x">go</button>\n}\n`;
  assert.deepEqual(verify(body, 'apps/demo/src/components/Ledgered.tsx'), []);
  assert.deepEqual(verify(body, 'apps/demo/src/app/studio/page.tsx'), []);
});

test('a component that consumes MoonUI primitives reports nothing', () => {
  const messages = verify(
    `import { Button } from '@moonwitness/moonui'\nexport function Toolbar() {\n  return <div><Button>go</Button></div>\n}\n`,
    'apps/demo/src/components/Toolbar.tsx',
  );
  assert.deepEqual(messages, []);
});
