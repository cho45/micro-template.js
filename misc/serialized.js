#!/usr/bin/env node

import assert from 'assert';
import { template, extended } from '../lib/micro-template.js';
import { writeFile } from 'fs/promises';

const target = {
	'main': [`
		HEADER
		<% wrapper('wrapper', function () { %>
			hello <%= foo %>,
			<% [1,2].forEach( () => { %>
			and <%= baz %>
			<% }) %>
		<% }) %>
		<% include('footer', { year: 2025 }) %>
		FOOTER
	`, ['foo', 'baz'] ],

	'wrapper': [`
		BEFORE CONTENT
		<%=raw content %>
		AFTER CONTENT
	`, ['content'] ],

	'footer': [`
		<footer>
			<p>Footer content <%= year %></p>
		</footer>
	`, [ 'year'] ],
}
template.get = id => target[id][0];

let serialized = 'const compiled = {};\n';

for (const [id, entry] of Object.entries(target)) {
	const [_, keys] = entry;
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
	return func.call(null, me.context = { escapeHTML, line: 1, ret: '', stash }, ...func.keys.map(key => stash[key]));
}).toString() + ';\n';

serialized += `const extended = ` + extended.toString() + ';\n';

serialized += `export { template, extended };\n`;

(async () => {
	await writeFile('_serialized.js', serialized);
	const { template, extended } = await import('../_serialized.js');
	const result = extended('main', { foo: 'world', baz: 'baz!' });
	console.log('render result:', result);
})();
