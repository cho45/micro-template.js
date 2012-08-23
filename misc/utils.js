#!/usr/bin/env node

var template = require('../lib/micro-template.js').template;
var data = getTextData();
template.get = function (id) { return data[id] };

(function () {
	//@includeA
	// aaa
	// <% include('includeB') %>
	// ccc

	//@includeB
	// bbb

	var include = function (name) {
		template.context.ret += template(name, template.context.stash);
	};

	var a = template('includeA', { include : include });
	console.log(a);
})();

console.log('==============');

(function () {
	//@wrapper
	// foo
	// <%=raw content %>
	// bar

	//@wrapperContent
	// aaa
	// <% wrapper('wrapper', function () { %>
	// !!!
	// <%= foo %>
	// !!!
	// <% }) %>
	// bbb

	var wrapper = function (name, fun) {
		var current = template.context.ret;
		template.context.ret = '';
		fun.apply(template.context);
		var content = template.context.ret;
		template.context.ret = current + template(name, { content : content });
	};

	var b = template('wrapperContent', { wrapper : wrapper, foo : 'foo' });
	console.log(b);
})();

function getTextData () {
	var body = require('fs').readFileSync(__filename, 'utf-8');
	var data = {};
	body.replace(RegExp('\\s*//@(.+)\n((?:\\s*// .+\n)+)', 'g'), function (_, name, body) {
		data[name] = body.replace(/^\s*\/\/ /gm, '');
	});
	return data;
}
