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

test('serializeTemplates: handles empty keys and missing keys meta', async (t) => {
  const templates = {
    'noKeys': { source: 'foo' },
    'emptyKeys': { source: 'bar', keys: [] },
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  const outFile = join(tmpdir(), 'generated-templates-nokeys-' + Date.now() + '.mjs');
  await writeFile(outFile, code);
  const { extended } = await import('file://' + outFile + '?t=' + Date.now());
  assert.strictEqual(extended('noKeys', {}), 'foo');
  assert.strictEqual(extended('emptyKeys', {}), 'bar');
});

test('serializeTemplates: template id is path without extension', async (t) => {
  const templates = {
    'foo/bar/baz': { source: 'baz', keys: [] }
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  assert.match(code, /'foo\/bar\/baz'/);
});

test('serializeTemplates: handles multiple meta comments', async (t) => {
  const templates = {
    'multi': {
      source: 'foo <!--meta.keys=[\"x\"]--><!--meta.description=\"desc\"-->',
      keys: ['x'],
      description: 'desc'
    }
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  assert.match(code, /description/);
  assert.match(code, /keys/);
});

test('serializeTemplates: handles invalid meta JSON gracefully', async (t) => {
  const templates = {
    'invalid': {
      source: 'foo <!--meta.keys=notjson-->',
      keys: []
    }
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  assert.match(code, /invalid/);
});

test('serializeTemplates: works with nested template ids', async (t) => {
  const templates = {
    'a/b/c': { source: 'nested', keys: [] }
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  const outFile = join(tmpdir(), 'generated-templates-nested-' + Date.now() + '.mjs');
  await writeFile(outFile, code);
  const { extended } = await import('file://' + outFile + '?t=' + Date.now());
  assert.strictEqual(extended('a/b/c', {}), 'nested');
});

test('serializeTemplates: missing variable is undefined string', async (t) => {
  const templates = {
    'main': { source: 'Hello <%= name %>!', keys: ['name'] }
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  const outFile = join(tmpdir(), 'generated-templates-missingvar-' + Date.now() + '.mjs');
  await writeFile(outFile, code);
  const { extended } = await import('file://' + outFile + '?t=' + Date.now());
  assert.strictEqual(extended('main', {}), 'Hello undefined!');
});

test('serializeTemplates: extra variables are ignored', async (t) => {
  const templates = {
    'main': { source: 'Hello <%= name %>!', keys: ['name'] }
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  const outFile = join(tmpdir(), 'generated-templates-extravars-' + Date.now() + '.mjs');
  await writeFile(outFile, code);
  const { extended } = await import('file://' + outFile + '?t=' + Date.now());
  assert.strictEqual(extended('main', { name: 'world', foo: 'bar' }), 'Hello world!');
});

test('serializeTemplates: wrapper template renders content', async (t) => {
  const templates = {
    'wrapper': {
      source: 'BEFORE CONTENT <%= content %> AFTER CONTENT',
      keys: ['content']
    },
	'main': {
	  source: 'BEFORE WRAPPER <% wrapper("wrapper", function () { %> Hello, <%= name %>! <% }) %> AFTER WRAPPER',
	  keys: ['name']
	}
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  const outFile = join(tmpdir(), 'generated-templates-wrapper-' + Date.now() + '.mjs');
  await writeFile(outFile, code);
  const { extended } = await import('file://' + outFile + '?t=' + Date.now());
  assert.strictEqual(extended('main', { name: 'foobar' }), 'BEFORE WRAPPER BEFORE CONTENT  Hello, foobar!  AFTER CONTENT AFTER WRAPPER');
});

test('serializeTemplates: include renders template', async (t) => {
  const templates = {
    'other': {
      source: '<div><%= name %></div>',
      keys: ['name']
    },
    'main': {
      source: 'BEFORE <% include("other", { name: "foobar" }) %> AFTER',
      keys: []
    }
  };
  const code = serializeTemplates(templates, { exportName: 'extended' });
  const outFile = join(tmpdir(), 'generated-templates-include-' + Date.now() + '.mjs');
  await writeFile(outFile, code);
  const { extended } = await import('file://' + outFile + '?t=' + Date.now());
  assert.strictEqual(
    extended('main', {}),
    'BEFORE <div>foobar</div> AFTER'
  );
});
