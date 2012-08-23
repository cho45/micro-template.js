#!/usr/bin/env node

var template = require('../lib/micro-template/extended').template;
var data = getTextData();
template.get = function (id) { return data[id] };

(function () {
	//@includeA
	// aaa
	// <% include('includeB') %>
	// ccc

	//@includeB
	// bbb

	var a = template('includeA', {});
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

	var b = template('wrapperContent', { foo : 'foo' });
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
