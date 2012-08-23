#!/usr/bin/env node

var assert = require('assert');
var template = require('../lib/micro-template.js').template;
var extended = require('../lib/micro-template/extended').template;

template.get = function (id) { return require('fs').readFileSync('test/data-' + id + '.tmpl', 'utf-8') };

(function () {
	var a = template('<b><%= foo %></b><i><%= bar %></i>');
	assert.equal(typeof a, 'function');
	assert.equal(a({ foo : 'foo', bar: 'bar' }), '<b>foo</b><i>bar</i>');

	assert.equal(template('<b><%= foo %></b><i><%= bar %></i>', { foo : 'foo', bar: 'bar' }), '<b>foo</b><i>bar</i>');

	assert.equal(template("<a href='foo'>foo</a>", {}), "<a href='foo'>foo</a>");
	assert.equal(template('<a href="foo">foo</a>', {}), '<a href="foo">foo</a>');

	assert.equal(template('foo<% if ("a") { %><%= "aa" %>bar<% } %><%=raw "baz" %>', {}), 'fooaabarbaz');
	assert.equal(template("foo<% if ('a') { %><%= 'aa' %>bar<% } %><%=raw 'baz' %>", {}), 'fooaabarbaz');

	assert.equal(template("<a href='foo'><%= foo %></a>", { foo : 'foo' }), "<a href='foo'>foo</a>");
	assert.equal(template('<a href="foo"><%= foo %></a>', { foo : 'foo' }), '<a href="foo">foo</a>');
})();


(function () {
	var escaped = template('<%= html %>');
	assert.equal(escaped({ html : '<foobar>'}), '&lt;foobar&gt;');
	assert.equal(escaped({ html : '<">'}), '&lt;&x22;&gt;');
	assert.equal(escaped({ html : "<'>"}), '&lt;&x27;&gt;');

	var raw = template('<%=raw raw %>');
	assert.equal(raw({ raw : '<foobar>'}), '<foobar>');
})();

(function () {
	var test1 = template('test1');
	assert.equal(typeof test1, 'function');
	assert.strictEqual(template('test1'), test1);

	assert.equal(test1({
		isFoo : true,
		foobar : 'foo<b>ar',
		foobaz : 'foo<b>az',
		html : '<b>html</b>'
	}), "\nfoo&lt;b&gt;ar\n");


	assert.equal(test1({
		isFoo : false,
		foobar : 'foo<b>ar',
		foobaz : 'foo<b>az',
		html : '<b>html</b>'
	}), "\nfoo&lt;b&gt;az\n");

	var error;
	assert.throws(function () {
		try {
			test1({});
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.equal(error, 'TemplateError: isFoo is not defined (on test1 line 1)');

	assert.throws(function () {
		try {
			test1({ isFoo: true });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.equal(error, 'TemplateError: foobar is not defined (on test1 line 2)');

	assert.throws(function () {
		try {
			test1({ isFoo: false });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.equal(error, 'TemplateError: foobaz is not defined (on test1 line 4)');
})();

(function () {
	var fizzbuzz = template('fizzbuzz');
	assert.equal(fizzbuzz({ n : 15 }).replace(/\s+/g, ' '), ' 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz ');
})();

(function () {
	assert.equal(extended('includeA', {}), 'aaa\nbbb\nccc');
	assert.equal(extended('wrapperContent', { foo: 'foo' }), 'aaa\nfoo\n\n!!!\nfoo\n!!!\n\nbar\nbbb');
})();

