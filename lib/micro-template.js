/**
 * https://github.com/cho45/micro-template.js
 * (c) cho45 http://cho45.github.com/mit-license
 */
const template = function (id, data) {
	const me = template;
	if (!me.cache[id]) me.cache[id] = (function () {
		let name = id, string = /^[\w\-]+$/.test(id) ? me.get(id): (name = 'template(string)', id); // no warnings
		let line = 1;
		const body = (
			"try { " +
				(me.variable ?  "let " + me.variable + " = this.stash;" : "with (this.stash) { ") +
					"this.ret += '"  +
					string.
						replace(/<%/g, '\x11').replace(/%>/g, '\x13'). // if you want other tag, just edit this line
						replace(/'(?![^\x11\x13]+?\x13)/g, '\\x27').
						replace(/^\s*|\s*$/g, '').
						replace(/\n|\r\n/g, function () { return "';\nthis.line = " + (++line) + "; this.ret += '\\n" }).
						replace(/\x11=raw(.+?)\x13/g, "' + ($1) + '").
						replace(/\x11=(.+?)\x13/g, "' + this.escapeHTML($1) + '").
						replace(/\x11(.+?)\x13/g, "'; $1; this.ret += '") +
				"'; " + (me.variable ? "" : "}") + "return this.ret;" +
			"} catch (e) { throw 'TemplateError: ' + e + ' (on " + name + "' + ' line ' + this.line + ')'; } " +
			"//@ sourceURL=" + name + "\n" // source map
		).replace(/this\.ret \+= '';/g, '');
		const func = new Function(body);
		const map  = { '&' : '&amp;', '<' : '&lt;', '>' : '&gt;', '\x22' : '&#x22;', '\x27' : '&#x27;' };
		const escapeHTML = function (string) { return (''+string).replace(/[&<>\'\"]/g, function (_) { return map[_] }) };
		return function (stash) { return func.call(me.context = { escapeHTML: escapeHTML, line: 1, ret : '', stash: stash }) };
	})();
	return data ? me.cache[id](data) : me.cache[id];
}
template.cache = {};
template.get = function (id) { return document.getElementById(id).innerHTML };

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

	return data ? fun(data) : fun;
}

template.get = function (id) {
	const fun = extended.get;
	return fun ? fun(id) : document.getElementById(id).innerHTML;
};
export { template, extended };
