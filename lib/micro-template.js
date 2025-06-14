/**
 * https://github.com/cho45/micro-template.js
 * (c) cho45 http://cho45.github.com/mit-license
 */
const template = function (id, data) {
	if (arguments.length < 2) throw new Error('template() must be called with (template, data)');
	const me = template, isArray = Array.isArray(data), keys = isArray ? data : Object.keys(data || {}), key = `data:${id}:${keys.sort().join(':')}`;
	if (!me.cache.has(key)) me.cache.set(key, (function () {
		let name = id, string = /^[\w\-]+$/.test(id) ? me.get(id): (name = `template-${Math.random().toString(36).slice(2)}`, id); // no warnings
		let line = 1;
		const body = (
			`try {` +
				(me.variable ?  `let ${me.variable}=__this.stash;` : ``) +
				string.trim().split(/(<%.+?%>)/g).map(part =>
					part.startsWith('<%=raw') && part.endsWith('%>') ? `/*raw*/__this.ret+=(${part.slice(6, -2)});` :
					part.startsWith('<%=') && part.endsWith('%>')    ? `/*=*/__this.ret+=__this.escapeHTML(${part.slice(3, -2)});` :
					part.startsWith('<%') && part.endsWith('%>')     ? `/* */${part.slice(2, -2)};` :
					(
						part = part.replace(/\\/g, "\\\\")
								.replace(/'/g, "\\'")
								.replace(/\n|\r\n/g, () => `';\n__this.line=${++line};__this.ret+='\\n`),
						part ? `/*+*/__this.ret+='${part}';` : ''
					)
				).join('') +
				`/*end*/ return __this.ret;` +
			`} catch (e) { throw new Error('TemplateError: '+e+' (on ${name} line ' + __this.line + ')',{cause:e}); }` +
			`//# sourceURL=${name}\n` + 
			`//# sourceMappingURL=data:application/json,${encodeURIComponent(JSON.stringify({version:3, file:name, sources:[`${name}.ejs`], sourcesContent:[string], mappings:";;AAAA;"+Array(line).fill('AACA').join(';')}))}`
		);
		const func = new Function("__this", ...keys, body);
		return function (stash) { return func.call(null, me.context = { escapeHTML: me.escapeHTML, line: 1, ret : '', stash: stash }, ...keys.map(key => stash[key])) };
	})());
	return isArray ? me.cache.get(key) : me.cache.get(key)(data);
}
template.cache = new Map();
template.get = function (id) { return document.getElementById(id).innerHTML };
template.escapeHTML = (function () {
	const regexp = /[<>"'&]/;
	return function (str) {
		if (typeof str !== 'string') str = String(str);
		let match = regexp.exec(str);
		if (match === null) return str;
		let result = str.slice(0, match.index);
		for (let i = match.index, len = str.length; i < len; i++) {
			switch (str.charCodeAt(i)) {
				case 60: result += '&lt;'; break; // <
				case 62: result += '&gt;'; break; // >
				case 34: result += '&#x22;'; break; // "
				case 39: result += '&#x27;'; break; // '
				case 38: result += '&amp;'; break; // &
				default: result += str[i]; break;
			}
		}
		return result;
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
	const inject = {
		include : function (name, args) {
			const stash =  Object.assign({}, template.context.stash, args);
			const context = template.context;
			context.ret += template(name, stash);
			template.context = context;
		},

		wrapper : function (name, fun) {
			const current = template.context.ret;
			template.context.ret = '';
			fun.apply(template.context);
			const content = template.context.ret;
			const orig_content = template.context.stash.content;
			template.context.stash.content = content;
			template.context.ret = current + template(name, template.context.stash);
			template.context.stash.content = orig_content;
		},
	}
	return template(id, Array.isArray(data) ? Object.keys(inject).concat(data) : Object.assign({}, data, inject));
}

template.get = function (id) {
	const fun = extended.get;
	return fun ? fun(id) : document.getElementById(id).innerHTML;
};
export { template, extended };
