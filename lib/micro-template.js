function template (id, data) {
	var me = arguments.callee; if (!me.cache) me.cache = {};
	if (!me.cache[id]) me.cache[id] = (function () {
		var name = id, string = /^[\w\-]+$/.test(id) ? me.get(id): (name = 'template(string)', id); // no warnings
		var line = 1, body =
			"var map = { '&' : '&amp;', '<' : '&lt;', '>' : '&gt;', '\\\x22' : '&x22;', '\\\x27' : '&x27;' };" +
			"try { this.__line = 1;" +
				"this.__ret = ''; with (stash) { this.__ret += '"  +
					string.
						replace(/'/g, '\\x27').
						replace(/^\s*|\s*$/g, '').
						replace(/\n/g, function () { line++; return "\\n';\nthis.__line = " + line + "; this.__ret += '" }).
						replace(/<%=raw(.+?)%>/g, "' + ($1) + '").
						replace(/<%=(.+?)%>/g, "' + escapeHTML($1+'') + '").
						replace(/<%(.+?)%>/g, "'; $1; this.__ret += '") +
				"'; } return this.__ret;" +
			"} catch (e) { throw 'TemplateError: ' + e.message + ' (on " + name + "' + ' line ' + this.__line + ')'; } " +
			"//@ sourceURL=" + name + "\n" + // source map
			"function escapeHTML (string) { return string.replace(/[&<>\'\"]/g, function (_) { return map[_] }); };";
		var func = new Function("stash", body);
		return function () { return func.apply({}, arguments) };
	})();
	return data ? me.cache[id](data) : me.cache[id];
}
template.get = function (id) { return document.getElementById(id).innerHTML };

this.template = template;
