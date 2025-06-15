#!/usr/bin/env node

import { template, extended } from './micro-template.js';

export function serializeTemplates(target) {
	template.get = id => target[id].source;
	template.cache.clear();

	let serialized = 'const compiled = {};\n';

	for (const [id, entry] of Object.entries(target)) {
		const keys = entry.keys || [];
		console.log(`Compiling template: ${id}`);
		const func = extended(id, keys);
		const compiled = func.compiled;
		serialized += `compiled['${id}'] = ` + compiled.toString().replace(/\/\/#.*/g, '') + ';\n';
		serialized += `compiled['${id}'].keys = ` + JSON.stringify(func.keys) + ';\n';
	}

	serialized += `const regexp = /[<>"'&]/;\n`;
	serialized += `const escapeHTML = ` + template.escapeHTML.toString() + ';\n';

	serialized += `const template = ` + (function (id, stash) {
		const me = template;
		const func = compiled[id];
		if (!func) {
			throw new Error(`Template "${id}" not found.`);
		}
		return func.call(null, me.context = { escapeHTML, line: 1, ret: '', stash }, ...func.keys.map(key => stash[key]));
	}).toString() + ';\n';

	serialized += `const extended = ` + extended.toString() + ';\n';

	serialized += `export { template, extended };\n`;

	return serialized;
}
