#!/usr/bin/env node

import { serializeTemplates } from '../lib/serializer.js';
import { promises as fs } from 'fs';
import path from 'path';

const USAGE = `
Usage: micro-template-serialize <input1.tmpl> ... --output <output.js> [--root <dir>]

Purpose:
  Reads one or more template files, extracts their content and meta information
  (such as keys defined in <!--meta.keys=[...]-->), and serializes them into a JavaScript file.
  The template ID is determined by the relative path from the root directory (without extension).

  This tool is especially useful for environments where dynamic function generation
  (such as with new Function()) is not allowed, as it outputs pre-serialized ESM modules.

Arguments:
  <input1.tmpl> ...         List of template files to serialize.
  --output <output.js>      Output JavaScript file (required).
  --root <dir>              Root directory for template IDs (default: current directory).
  --help, -h                Show this help message.

Example:
  micro-template-serialize test/data-test1.tmpl test/data-fizzbuzz.tmpl --output templates.js --root test

  And this will generate a file named 'templates.js' in the current directory.
  You can then import the generated module in your JavaScript code:

  import { extended as template } from './templates.js';
  const result = template('main', { foo: 'world', baz: 'baz!' });
  console.log('render result:', result);

Notes:
  - If a template does not contain a <!--meta.keys=[...]--> comment, a warning will be shown.
  - The output file will contain the serialized templates using the serializeTemplates function.
  - The output file is an ESM module (use 'import' to load it).
`;

// --- 引数パース ---
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
	console.log(USAGE);
	process.exit(0);
}
let outputFile;
let rootDir = process.cwd();
const inputFiles = [];
for (let i = 0; i < args.length; i++) {
	if (args[i] === '--output') {
		outputFile = args[++i];
	} else
	if (args[i] === '--root') {
		rootDir = args[++i];
	} else {
		inputFiles.push(args[i]);
	}
}
if (!outputFile || inputFiles.length === 0) {
	console.error('Usage: micro-template-serialize <input1.tmpl> ... --output templates.js [--root <dir>]');
	process.exit(1);
}

// --- テンプレートファイル読み込み ---
const templates = {};
for (const file of inputFiles) {
	// id を rootDir からの相対パス（拡張子除く）にする
	const relPath = path.relative(rootDir, file);
	const id = relPath.replace(path.extname(relPath), '');
	const source = await fs.readFile(file, 'utf-8');
	templates[id] = { source };
	source.replace(/<!--meta\.(\w+)=(.+?)-->/g, (match, key, value) => {
		templates[id][key] = JSON.parse(value);
		return ''; // Remove the comment
	});
	if (!templates[id].keys) {
		console.warn(`Warning: Template "${id}" does not have keys defined. Please add <!--meta.keys=["key1", "key2"]--> in the template file.`);
		templates[id].keys = [];
	}
}

const code = serializeTemplates(templates);
await fs.writeFile(outputFile, code);
console.log(`Wrote: ${outputFile}`);
