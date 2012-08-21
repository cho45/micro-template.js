function template (id, data) {
	var me = arguments.callee; if (!me.cache) me.cache = {};
	if (!me.cache[id]) me.cache[id] = (function () {
		var name = id, string = /^[\w\-]+$/.test(id) ? me.get(id): (name = 'template(string)', id); // no warnings
		var line = 1, body =
			"try { var __line = 1; var map = { '&' : '&amp;', '<' : '&lt;', '>' : '&gt;', '\\\x22' : '&x22;', '\\\x27' : '&x27;' };" +
				"var ret = ''; with (stash) { ret += '"  +
					string.
						replace(/'/g, '\\x27').
						replace(/^\s*|\s*$/g, '').
						replace(/\n/g, function () { line++; return "\\n';\n__line = " + line + "; ret += '" }).
						replace(/<%=raw(.+?)%>/g, "' + ($1) + '").
						replace(/<%=(.+?)%>/g, "' + escapeHTML($1+'') + '").
						replace(/<%(.+?)%>/g, "'; $1; ret += '") +
				"'; } return ret;" +
			"} catch (e) { throw 'TemplateError: ' + e.message + ' (on " + name + "' + ' line ' + __line + ')'; } " +
			"//@ sourceURL=" + name + "\n" + // source map
			"function escapeHTML (string) { return string.replace(/[&<>\'\"]/g, function (_) { return map[_] }); };";
		return new Function("stash", body);
	})();
	return data ? me.cache[id](data) : me.cache[id];
}
template.get = function (id) { return document.getElementById(id).innerHTML };

this.template = template;
