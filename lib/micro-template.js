function template (id, data) {
	var me = arguments.callee; if (!me.cache) me.cache = {};
	if (!me.cache[id]) me.cache[id] = (function () {
		var name = id, string = /^[\w\-]+$/.test(id) ? me.get(id): (name = 'template(string)', id); // no warnings
		var line = 1, body = (
			"try { " +
				"with (stash) { this.__ret += '"  +
					string.
						replace(/'/g, '\\x27').
						replace(/^\s*|\s*$/g, '').
						replace(/\n/g, function () { return "';\nthis.__line = " + (++line) + "; this.__ret += '\\n" }).
						replace(/<%=raw(.+?)%>/g, "' + ($1) + '").
						replace(/<%=(.+?)%>/g, "' + this.escapeHTML($1+'') + '").
						replace(/<%(.+?)%>/g, "'; $1; this.__ret += '") +
				"'; } return this.__ret;" +
			"} catch (e) { throw 'TemplateError: ' + e.message + ' (on " + name + "' + ' line ' + this.__line + ')'; } " +
			"//@ sourceURL=" + name + "\n" // source map
		).replace(/this\.__ret \+= '';/g, '');
		var func = new Function("stash", body);
		var map  = { '&' : '&amp;', '<' : '&lt;', '>' : '&gt;', '\x22' : '&x22;', '\x27' : '&x27;' };
		var escapeHTML = function (string) { return string.replace(/[&<>\'\"]/g, function (_) { return map[_] }) };
		return function () { return func.apply({ escapeHTML: escapeHTML, __line: 1, __ret : '' }, arguments) };
	})();
	return data ? me.cache[id](data) : me.cache[id];
}
template.get = function (id) { return document.getElementById(id).innerHTML };

this.template = template;
