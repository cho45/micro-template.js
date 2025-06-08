/**
 * https://github.com/cho45/micro-template.js
 * (c) cho45 http://cho45.github.com/mit-license
 */
const template = function (id, data) {
	if (arguments.length < 2) throw new Error('template() must be called with (template, data)');
	const me = template, keys = Object.keys(data || {}), key = `data:${id}:${keys.join(':')}`;
	if (!me.cache.has(key)) me.cache.set(key, (function () {
		let name = id, string = /^[\w\-]+$/.test(id) ? me.get(id): (name = 'template(string)', id); // no warnings
		let line = 1;
		const body = (
			`try { ` +
				(me.variable ?  `let ${me.variable} = __this.stash;` : ``) +
				string.trim().split(/(<%.+?%>)/g).map(part =>
					part.startsWith('<%=raw') && part.endsWith('%>') ? `/*raw*/__this.ret+=(${part.slice(6, -2)});` :
					part.startsWith('<%=') && part.endsWith('%>')    ? `/*=*/__this.ret+=__this.escapeHTML(${part.slice(3, -2)});` :
					part.startsWith('<%') && part.endsWith('%>')     ? `/* */${part.slice(2, -2)};` :
					(
						part = part.replace(/\\/g, "\\\\")
								.replace(/'/g, "\\'")
								.replace(/\n|\r\n/g, () => `\\n';\n__this.line = ${++line}; __this.ret += '`),
						part ? `/*+*/__this.ret+='${part}';` : ''
					)
				).join('') +
				`/*end*/ return __this.ret;` +
			`} catch (e) { throw new Error('TemplateError: ' + e + ' (on ${name} line ' + __this.line + ')'); }` +
			`//@ sourceURL=template.js\n`
		);
		const func = new Function("__this", ...keys, body);
		return function (stash, ...args) { return func.call(null, me.context = { escapeHTML: me.escapeHTML, line: 1, ret : '', stash: stash }, ...args) };
	})());
	return me.cache.get(key)(data, ...keys.map(key => data[key]));
}
template.cache = new Map();
template.get = function (id) { return document.getElementById(id).innerHTML };
template.escapeHTML = (function () {
	const map  = new Map([ [ `&`, `&amp;` ], [ `<`, `&lt;` ], [ `>`, `&gt;` ], [ `"`, `&#x22;` ], [ `'`, `&#x27;` ] ].map(([k, v]) => [k.charCodeAt(0), v]));
	const regexp = /[<>"'&]/g;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		regexp.lastIndex = 0;
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = '', lastIndex = 0;
		do {
			result += str.slice(lastIndex, match.index) + map.get(str.charCodeAt(match.index));
			lastIndex = regexp.lastIndex;
		} while ((match = regexp.exec(str)) !== null);
		return result + str.slice(lastIndex);
	};
})();

/**
 * Extended template function:
 *   requires: basic template() function
 *   provides:
 *     include(id)
 *     wrapper(id, function () {})
 */
function extended (id, data) {
	const fun = function (data) {
		data.include = function (name, args) {
			const stash = {};
			for (const key in template.context.stash) if (template.context.stash.hasOwnProperty(key)) {
				stash[key] = template.context.stash[key];
			}
			if (args) for (const key in args) if (args.hasOwnProperty(key)) {
				stash[key] = args[key];
			}
			const context = template.context;
			context.ret += template(name, stash);
			template.context = context;
		};

		data.wrapper = function (name, fun) {
			const current = template.context.ret;
			template.context.ret = '';
			fun.apply(template.context);
			const content = template.context.ret;
			const orig_content = template.context.stash.content;
			template.context.stash.content = content;
			template.context.ret = current + template(name, template.context.stash);
			template.context.stash.content = orig_content;
		};

		return template(id, data);
	};

	return fun(data);
}

template.get = function (id) {
	const fun = extended.get;
	return fun ? fun(id) : document.getElementById(id).innerHTML;
};
export { template, extended };
