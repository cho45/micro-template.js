#!/usr/bin/env node

var assert = require('assert');
var template = require('../lib/micro-template.js').template;
var extended = require('../lib/micro-template.js').extended;

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

	// function must be bound with this
	assert.equal(template('<% array.forEach(function (i) { %><%= i %><% }, this) %>', { array : [1, 2, 3] }), '123');

	// or supply other function
	var each = function (array, func) {
		for (var i = 0, len = array.length; i < len; i++)
			func.call(template.context, array[i]);
	};
	assert.equal(template('<% each(array, function (i) { %><%= i %><% }) %>', { array : [1, 2, 3], each : each }), '123');
})();

(function () {
	template.variable = 'stash';

	assert.equal(template('<b><%= stash.foo %></b><i><%= stash.bar %></i>', { foo : 'foo', bar: 'bar' }), '<b>foo</b><i>bar</i>');

	template.variable = null;
})();


(function () {
	var escaped = template('<%= html %>');
	assert.equal(escaped({ html : '<foobar>'}), '&lt;foobar&gt;');
	assert.equal(escaped({ html : '<">'}), '&lt;&#x22;&gt;');
	assert.equal(escaped({ html : "<'>"}), '&lt;&#x27;&gt;');

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
	assert.equal(error, 'TemplateError: ReferenceError: isFoo is not defined (on test1 line 1)');

	assert.throws(function () {
		try {
			test1({ isFoo: true });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.equal(error, 'TemplateError: ReferenceError: foobar is not defined (on test1 line 2)');

	assert.throws(function () {
		try {
			test1({ isFoo: false });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.equal(error, 'TemplateError: ReferenceError: foobaz is not defined (on test1 line 4)');
})();

(function () {
	var fizzbuzz = template('fizzbuzz');
	assert.equal(fizzbuzz({ n : 15 }).replace(/\s+/g, ' '), ' 1 2 Fizz 4 Buzz Fizz 7 8 Fizz Buzz 11 Fizz 13 14 FizzBuzz ');
})();

(function () {
	var a = extended('<b><%= foo %></b><i><%= bar %></i>');
	assert.equal(typeof a, 'function');
	assert.equal(a({ foo : 'foo', bar: 'bar' }), '<b>foo</b><i>bar</i>');
})();

(function () {
	assert.equal(extended('includeA', {}), 'aaa\nbbb\nccc\nbbb');
})();

(function () {
	assert.equal(extended('wrapperContent', { foo: 'foo', bar: 'bar' }), '111\n222\n\n333\nfoo\n444\n\n555\nbar\n666\n777');

	assert.throws(function () {
		try {
			extended('wrapperContent', { bar: 'xxx' });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.equal(error, 'TemplateError: ReferenceError: foo is not defined (on wrapperContent line 4)');

	assert.throws(function () {
		try {
			extended('wrapperContent', { foo: 'xxx' });
		} catch (e) {
			error = e;
			throw e;
		}
	});
	assert.equal(error, 'TemplateError: TemplateError: ReferenceError: bar is not defined (on wrapper line 4) (on wrapperContent line 6)');
})();
