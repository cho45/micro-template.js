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
	console.error('❌ Error: Missing required arguments');
	if (!outputFile) console.error('   Missing --output flag');
	if (inputFiles.length === 0) console.error('   No input template files specified');
	console.error('\nUsage: micro-template-serialize <input1.tmpl> ... --output templates.js [--root <dir>]');
	console.error('Use --help for more information');
	process.exit(1);
}

// --- テンプレートファイル読み込み ---
console.log(`🔄 Processing ${inputFiles.length} template file(s)...`);
console.log(`📁 Root directory: ${rootDir}`);
console.log(`📄 Output file: ${outputFile}`);
console.log('');

const templates = {};
for (let i = 0; i < inputFiles.length; i++) {
	const file = inputFiles[i];
	// id を rootDir からの相対パス（拡張子除く）にする
	const relPath = path.relative(rootDir, file);
	const id = relPath.replace(path.extname(relPath), '');
	
	try {
		const source = await fs.readFile(file, 'utf-8');
		templates[id] = { source };
		
		// メタデータの抽出
		source.replace(/<!--meta\.(\w+)=(.+?)-->/g, (match, key, value) => {
			templates[id][key] = JSON.parse(value);
			return ''; // Remove the comment
		});
		
		if (!templates[id].keys) {
			console.warn(`⚠️  Template "${id}" does not have keys defined. Please add <!--meta.keys=["key1", "key2"]--> in the template file.`);
			templates[id].keys = [];
		}
		
		console.log(`✅ [${i + 1}/${inputFiles.length}] ${file} → ${id} (${templates[id].keys?.length || 0} keys)`);
	} catch (error) {
		console.error(`❌ Failed to read ${file}: ${error.message}`);
		process.exit(1);
	}
}

console.log('\n🔄 Compiling templates...');
const startTime = Date.now();
const code = serializeTemplates(templates, {
	onProgress: ({ current, total, templateId, keys }) => {
		console.log(`  📝 [${current}/${total}] Compiling template: ${templateId} (${keys} keys)`);
	}
});
const endTime = Date.now();

console.log(`\n💾 Writing output file...`);
try {
	await fs.writeFile(outputFile, code);
	const stats = await fs.stat(outputFile);
	const fileSize = (stats.size / 1024).toFixed(2);
	
	console.log(`\n✨ Successfully generated template bundle!`);
	console.log(`📄 Output: ${outputFile}`);
	console.log(`📆 File size: ${fileSize} KB`);
	console.log(`🕰️ Compilation time: ${endTime - startTime}ms`);
	console.log(`📦 Templates included: ${Object.keys(templates).length}`);
	console.log('');
	console.log('Usage example:');
	console.log(`  import { extended as template } from './${path.basename(outputFile)}';`);
	console.log(`  const result = template('templateId', { key: 'value' });`);
} catch (error) {
	console.error(`❌ Failed to write output file: ${error.message}`);
	process.exit(1);
}
