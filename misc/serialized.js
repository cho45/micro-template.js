#!/usr/bin/env node

(async () => {
	const { template, extended } = await import('../_serialized.js');
	const result = extended('main', { foo: 'world', baz: 'baz!' });
	console.log('render result:', result);
})();
