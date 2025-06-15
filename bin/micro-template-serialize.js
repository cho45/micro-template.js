#!/usr/bin/env node

import { serializeTemplates } from '../lib/serializer.js';
import { promises as fs } from 'fs';
import path from 'path';

// --- 引数パース ---
const args = process.argv.slice(2);
let outputFile;
let rootDir = process.cwd();
const inputFiles = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output') {
    outputFile = args[++i];
  } else if (args[i] === '--root') {
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

const code = serializeTemplates(templates, { exportName: 'extended' });
await fs.writeFile(outputFile, code);
console.log(`Wrote: ${outputFile}`);
