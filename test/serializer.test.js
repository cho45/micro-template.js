import assert from 'assert';
import { test } from 'node:test';
import { serializeTemplates } from '../lib/serializer.js';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const templates = {
  'main': {
    source: 'Hello <%= name %>!',
    keys: ['name']
  },
  'sub/partial': {
    source: '<b><%= value %></b>',
    keys: ['value']
  }
};

test('serializeTemplates: ESM code can be imported and used', async (t) => {
  const code = serializeTemplates(templates, { exportName: 'extended' });
  const outFile = join(tmpdir(), 'generated-templates-' + Date.now() + '.mjs');
  await writeFile(outFile, code);
  const { extended: importedExtended } = await import('file://' + outFile + '?t=' + Date.now());
  assert.strictEqual(importedExtended('main', { name: 'world' }), 'Hello world!');
  assert.strictEqual(importedExtended('sub/partial', { value: 'X' }), '<b>X</b>');
});
